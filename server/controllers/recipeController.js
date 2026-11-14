const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');

const recipesFile = path.join(__dirname, '..', 'data', 'recipes.json');
const usersFile = path.join(__dirname, '..', 'data', 'users.json');
const maxPageSize = 100;

const readJsonArray = async (filePath, fileName) => {
  const content = await fs.readFile(filePath, 'utf8');
  const data = JSON.parse(content.replace(/^\uFEFF/, ''));

  if (!Array.isArray(data)) {
    throw new Error(`${fileName} phải chứa một mảng JSON.`);
  }

  return data;
};

// Ghi file tạm trước để giữ dữ liệu cũ nếu quá trình ghi bị lỗi.
const writeRecipes = async (recipes) => {
  const tempFile = path.join(
    path.dirname(recipesFile),
    `.recipes-${crypto.randomUUID()}.tmp`
  );

  try {
    await fs.writeFile(tempFile, `${JSON.stringify(recipes, null, 2)}\n`, 'utf8');
    await fs.rename(tempFile, recipesFile);
  } catch (error) {
    await fs.unlink(tempFile).catch(() => {});
    throw error;
  }
};

const parsePositiveInteger = (value, fallback) => {
  if (value === undefined) return fallback;
  if (typeof value !== 'string' || !/^\d+$/.test(value)) return null;

  const number = Number(value);
  return Number.isSafeInteger(number) && number > 0 ? number : null;
};

const normalizeText = (value) => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/đ/g, 'd')
  .replace(/Đ/g, 'D')
  .toLowerCase();

const sendServerError = (res, message, error) => {
  console.error(message, error);
  return res.status(500).json({ success: false, message });
};

// Xác minh userId và role từ users.json, không tin role gửi từ client.
const authorizeRecipeMutation = async (req, recipe) => {
  const headerUserId = req.headers?.['x-user-id'];
  const bodyUserId = req.body?.userId;
  const userId = (typeof headerUserId === 'string' && headerUserId.trim())
    || (typeof bodyUserId === 'string' && bodyUserId.trim());

  if (!userId) {
    return { status: 401, message: 'Vui lòng cung cấp userId.' };
  }

  const users = await readJsonArray(usersFile, 'users.json');
  const user = users.find((item) => String(item.id) === userId);

  if (!user) {
    return { status: 401, message: 'Không tìm thấy người dùng.' };
  }

  if (user.role !== 'admin' && String(recipe.authorId) !== String(user.id)) {
    return {
      status: 403,
      message: 'Bạn không có quyền chỉnh sửa/xóa món ăn này'
    };
  }

  return null;
};

const getRecipes = async (req, res) => {
  try {
    const page = parsePositiveInteger(req.query.page, 1);
    const limit = parsePositiveInteger(req.query.limit, 10);
    const searchQuery = req.query.search;

    if (page === null || limit === null) {
      return res.status(400).json({
        success: false,
        message: 'page và limit phải là số nguyên dương.'
      });
    }

    if (limit > maxPageSize) {
      return res.status(400).json({
        success: false,
        message: `limit không được vượt quá ${maxPageSize}.`
      });
    }

    if (searchQuery !== undefined && typeof searchQuery !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'search phải là một chuỗi.'
      });
    }

    const recipes = await readJsonArray(recipesFile, 'recipes.json');
    const searchTerm = normalizeText(searchQuery?.trim() ?? '');
    const filteredRecipes = searchTerm
      ? recipes.filter((recipe) => {
          const ingredients = Array.isArray(recipe.ingredients)
            ? recipe.ingredients.map((item) =>
                typeof item === 'string' ? item : item?.name
              )
            : [];
          const fields = [
            recipe.title,
            recipe.description,
            recipe.category,
            ...ingredients
          ];

          return fields.some(
            (field) => typeof field === 'string'
              && normalizeText(field).includes(searchTerm)
          );
        })
      : recipes;

    const totalItems = filteredRecipes.length;
    const totalPages = Math.ceil(totalItems / limit);
    const startIndex = (page - 1) * limit;

    return res.status(200).json({
      success: true,
      message: 'Lấy danh sách công thức thành công.',
      count: totalItems,
      pagination: { page, limit, totalItems, totalPages },
      data: filteredRecipes.slice(startIndex, startIndex + limit)
    });
  } catch (error) {
    return sendServerError(res, 'Không thể đọc danh sách công thức.', error);
  }
};

const getRecipeById = async (req, res) => {
  try {
    const recipes = await readJsonArray(recipesFile, 'recipes.json');
    const recipe = recipes.find((item) => String(item.id) === req.params.id);

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy công thức.'
      });
    }

    return res.status(200).json({ success: true, data: recipe });
  } catch (error) {
    return sendServerError(res, 'Không thể đọc chi tiết công thức.', error);
  }
};

const updateRecipe = async (req, res) => {
  try {
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu cập nhật không hợp lệ.'
      });
    }

    const recipes = await readJsonArray(recipesFile, 'recipes.json');
    const index = recipes.findIndex((item) => String(item.id) === req.params.id);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy công thức.'
      });
    }

    const authorizationError = await authorizeRecipeMutation(req, recipes[index]);

    if (authorizationError) {
      return res.status(authorizationError.status).json({
        success: false,
        message: authorizationError.message
      });
    }

    const editableFields = [
      'title', 'description', 'category', 'cookingTime', 'difficulty',
      'image', 'servings', 'equipment', 'ingredients', 'steps', 'reviews',
      'averageRating'
    ];
    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([key]) => editableFields.includes(key))
    );

    recipes[index] = { ...recipes[index], ...updates };
    await writeRecipes(recipes);

    return res.status(200).json({ success: true, data: recipes[index] });
  } catch (error) {
    return sendServerError(res, 'Không thể cập nhật công thức.', error);
  }
};

const deleteRecipe = async (req, res) => {
  try {
    const recipes = await readJsonArray(recipesFile, 'recipes.json');
    const index = recipes.findIndex((item) => String(item.id) === req.params.id);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy công thức.'
      });
    }

    const recipe = recipes[index];
    const authorizationError = await authorizeRecipeMutation(req, recipe);

    if (authorizationError) {
      return res.status(authorizationError.status).json({
        success: false,
        message: authorizationError.message
      });
    }

    recipes.splice(index, 1);
    await writeRecipes(recipes);

    return res.status(200).json({ success: true, data: recipe });
  } catch (error) {
    return sendServerError(res, 'Không thể xóa công thức.', error);
  }
};

module.exports = {
  getRecipes,
  getRecipeById,
  updateRecipe,
  deleteRecipe
};
