const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');
const { withLock } = require('../utils/mutex');

const dataDirectory = path.join(__dirname, '..', 'data');
const categoriesFile = path.join(dataDirectory, 'categories.json');
const recipesFile = path.join(dataDirectory, 'recipes.json');

const readStringArray = async (filePath, fileName) => {
  const content = await fs.readFile(filePath, 'utf8');
  const data = JSON.parse(content.replace(/^\uFEFF/, ''));
  if (!Array.isArray(data) || !data.every((item) => typeof item === 'string')) {
    throw new Error(`${fileName} phải chứa một mảng chuỗi JSON.`);
  }
  return data;
};

const writeJson = async (filePath, data) => {
  const tempFile = path.join(
    path.dirname(filePath),
    `.${path.basename(filePath, '.json')}-${crypto.randomUUID()}.tmp`
  );
  try {
    await fs.writeFile(tempFile, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
    await fs.rename(tempFile, filePath);
  } catch (error) {
    await fs.unlink(tempFile).catch(() => {});
    throw error;
  }
};

const sendError = (res, error, message) => {
  if (Number.isInteger(error.status) && error.status < 500) {
    return res.status(error.status).json({ success: false, message: error.message });
  }
  console.error(message, error);
  return res.status(500).json({ success: false, message });
};

const createHttpError = (status, message) => Object.assign(new Error(message), { status });

const requireAdmin = (req, res) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Vui lòng đăng nhập để tiếp tục.' });
    return false;
  }
  if (req.user.role !== 'admin') {
    res.status(403).json({ success: false, message: 'Chỉ quản trị viên được quản lý loại món.' });
    return false;
  }
  return true;
};

const validateName = (value) => {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > 40) {
    throw createHttpError(400, 'Tên loại món không được để trống và tối đa 40 ký tự.');
  }
  return value.trim();
};

const findCategoryIndex = (categories, name) => categories.findIndex(
  (category) => category.toLocaleLowerCase('vi') === name.toLocaleLowerCase('vi')
);

const createCategory = async (req, res) => {
  if (!requireAdmin(req, res)) return;

  try {
    const name = validateName(req.body?.name);
    const result = await withLock(async () => {
      const categories = await readStringArray(categoriesFile, 'categories.json');
      if (findCategoryIndex(categories, name) !== -1) {
        throw createHttpError(409, 'Loại món này đã tồn tại.');
      }
      await writeJson(categoriesFile, [...categories, name]);
      return name;
    });
    return res.status(201).json({ success: true, data: result });
  } catch (error) {
    return sendError(res, error, 'Không thể thêm loại món.');
  }
};

const updateCategory = async (req, res) => {
  if (!requireAdmin(req, res)) return;

  try {
    const name = validateName(req.body?.name);
    const result = await withLock(async () => {
      const categories = await readStringArray(categoriesFile, 'categories.json');
      const oldName = req.params.id;
      const index = findCategoryIndex(categories, oldName);
      if (index === -1) throw createHttpError(404, 'Không tìm thấy loại món.');

      const duplicateIndex = findCategoryIndex(categories, name);
      if (duplicateIndex !== -1 && duplicateIndex !== index) {
        throw createHttpError(409, 'Loại món này đã tồn tại.');
      }

      const recipes = await readStringArrayOfObjects(recipesFile);
      const updatedRecipes = recipes.map((recipe) => (
        recipe.category === categories[index] ? { ...recipe, category: name } : recipe
      ));
      const updatedCategories = [...categories];
      updatedCategories[index] = name;

      await writeJson(recipesFile, updatedRecipes);
      try {
        await writeJson(categoriesFile, updatedCategories);
      } catch (error) {
        await writeJson(recipesFile, recipes);
        throw error;
      }
      return name;
    });
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return sendError(res, error, 'Không thể đổi tên loại món.');
  }
};

const readStringArrayOfObjects = async (filePath) => {
  const content = await fs.readFile(filePath, 'utf8');
  const data = JSON.parse(content.replace(/^\uFEFF/, ''));
  if (!Array.isArray(data) || !data.every((item) => item && typeof item === 'object' && !Array.isArray(item))) {
    throw new Error('recipes.json phải chứa một mảng công thức.');
  }
  return data;
};

const deleteCategory = async (req, res) => {
  if (!requireAdmin(req, res)) return;

  try {
    await withLock(async () => {
      const categories = await readStringArray(categoriesFile, 'categories.json');
      const index = findCategoryIndex(categories, req.params.id);
      if (index === -1) throw createHttpError(404, 'Không tìm thấy loại món.');

      const recipes = await readStringArrayOfObjects(recipesFile);
      if (recipes.some((recipe) => recipe.category === categories[index])) {
        throw createHttpError(409, 'Loại món này đang có món sử dụng.');
      }

      categories.splice(index, 1);
      await writeJson(categoriesFile, categories);
    });
    return res.status(204).end();
  } catch (error) {
    return sendError(res, error, 'Không thể xóa loại món.');
  }
};

module.exports = { createCategory, updateCategory, deleteCategory };
