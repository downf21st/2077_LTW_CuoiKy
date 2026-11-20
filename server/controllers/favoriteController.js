const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');

const usersFile = path.join(__dirname, '..', 'data', 'users.json');
const recipesFile = path.join(__dirname, '..', 'data', 'recipes.json');
const favoritesFile = path.join(__dirname, '..', 'data', 'favorites.json');
const writeQueue = { current: Promise.resolve() };

const readArray = async (filePath, fileName) => {
  const content = await fs.readFile(filePath, 'utf8');
  const data = JSON.parse(content.replace(/^\uFEFF/, ''));
  if (!Array.isArray(data)) throw new Error(`${fileName} phải chứa một mảng JSON.`);
  return data;
};

const readFavorites = async () => {
  try {
    return await readArray(favoritesFile, 'favorites.json');
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
};

const writeFavorites = async (favorites) => {
  const tempFile = path.join(path.dirname(favoritesFile), `.favorites-${crypto.randomUUID()}.tmp`);
  try {
    await fs.writeFile(tempFile, `${JSON.stringify(favorites, null, 2)}\n`, 'utf8');
    await fs.rename(tempFile, favoritesFile);
  } catch (error) {
    await fs.unlink(tempFile).catch(() => {});
    throw error;
  }
};

const createHttpError = (status, message) => Object.assign(new Error(message), { status });

const getAuthorizedTarget = async (req) => {
  if (!req.user) throw createHttpError(401, 'Vui lòng đăng nhập để tiếp tục.');

  const users = await readArray(usersFile, 'users.json');
  const target = users.find((user) => String(user.id) === req.params.id);
  if (!target) throw createHttpError(404, 'Không tìm thấy người dùng.');
  if (req.user.role !== 'admin' && String(req.user.id) !== String(target.id)) {
    throw createHttpError(403, 'Bạn không có quyền xem danh sách yêu thích này.');
  }

  return target;
};

const sendError = (res, error, fallbackMessage) => {
  if (Number.isInteger(error.status) && error.status < 500) {
    return res.status(error.status).json({ success: false, message: error.message });
  }
  console.error(fallbackMessage, error);
  return res.status(500).json({ success: false, message: fallbackMessage });
};

const getFavorites = async (req, res) => {
  try {
    const target = await getAuthorizedTarget(req);
    const [favorites, recipes] = await Promise.all([
      readFavorites(),
      readArray(recipesFile, 'recipes.json')
    ]);
    const recipeIds = new Set(
      favorites
        .filter((item) => String(item.userId) === String(target.id))
        .map((item) => String(item.recipeId))
    );
    const data = recipes.filter((recipe) => {
      if (!recipeIds.has(String(recipe.id))) return false;
      return (recipe.status || 'approved') === 'approved'
        || req.user.role === 'admin'
        || String(recipe.authorId) === String(target.id);
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return sendError(res, error, 'Không thể đọc danh sách yêu thích.');
  }
};

const addFavorite = async (req, res) => {
  try {
    const target = await getAuthorizedTarget(req);
    const recipeId = typeof req.body?.recipeId === 'string' ? req.body.recipeId.trim() : '';
    if (!recipeId) throw createHttpError(400, 'recipeId là bắt buộc.');

    const recipes = await readArray(recipesFile, 'recipes.json');
    const recipe = recipes.find((item) => String(item.id) === recipeId);
    if (!recipe) throw createHttpError(404, 'Không tìm thấy công thức.');
    const isVisible = (recipe.status || 'approved') === 'approved'
      || req.user.role === 'admin'
      || String(recipe.authorId) === String(target.id);
    if (!isVisible) throw createHttpError(404, 'Không tìm thấy công thức.');

    const operation = writeQueue.current.then(async () => {
      const favorites = await readFavorites();
      const exists = favorites.some((item) =>
        String(item.userId) === String(target.id)
        && String(item.recipeId) === recipeId
      );
      if (exists) throw createHttpError(409, 'Món ăn đã có trong danh sách yêu thích.');

      await writeFavorites([...favorites, {
        userId: String(target.id),
        recipeId,
        createdAt: new Date().toISOString()
      }]);
    });
    writeQueue.current = operation.then(() => undefined, () => undefined);
    await operation;

    return res.status(201).json({ success: true, data: recipe });
  } catch (error) {
    return sendError(res, error, 'Không thể thêm món vào danh sách yêu thích.');
  }
};

const removeFavorite = async (req, res) => {
  try {
    const target = await getAuthorizedTarget(req);
    const operation = writeQueue.current.then(async () => {
      const favorites = await readFavorites();
      const index = favorites.findIndex((item) =>
        String(item.userId) === String(target.id)
        && String(item.recipeId) === req.params.recipeId
      );
      if (index === -1) throw createHttpError(404, 'Món ăn không có trong danh sách yêu thích.');

      const updated = favorites.filter((_, itemIndex) => itemIndex !== index);
      await writeFavorites(updated);
    });
    writeQueue.current = operation.then(() => undefined, () => undefined);
    await operation;

    return res.status(200).json({ success: true, message: 'Đã bỏ món khỏi danh sách yêu thích.' });
  } catch (error) {
    return sendError(res, error, 'Không thể xóa món khỏi danh sách yêu thích.');
  }
};

module.exports = { getFavorites, addFavorite, removeFavorite };
