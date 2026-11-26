const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');
const { withReviewStats } = require('../utils/reviewStats');
const { resolveStatusFilter } = require('./recipeStatusController');

const recipesFile = path.join(__dirname, '..', 'data', 'recipes.json');
const categoriesFile = path.join(__dirname, '..', 'data', 'categories.json');
const uploadsDirectory = path.join(__dirname, '..', 'public', 'uploads');
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
  .trim()
  .replace(/\s+/g, ' ')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/đ/g, 'd')
  .replace(/Đ/g, 'D')
  .toLowerCase();

const sendServerError = (res, message, error) => {
  console.error(message, error);
  return res.status(500).json({ success: false, message });
};

const createBadRequest = (message) => Object.assign(new Error(message), { status: 400 });

const parseFormArray = (value, fieldName, optional = false) => {
  if (value === undefined || value === '') {
    if (optional) return [];
    throw createBadRequest(`Thiếu trường ${fieldName}.`);
  }
  if (value === null) throw createBadRequest(`${fieldName} không được là null.`);

  let parsed;
  try {
    parsed = Array.isArray(value) ? value : JSON.parse(value);
  } catch {
    throw createBadRequest(`Trường ${fieldName} phải là JSON hợp lệ.`);
  }

  if (!Array.isArray(parsed) || (!optional && parsed.length === 0)) {
    throw createBadRequest(`${fieldName} phải là một mảng không rỗng.`);
  }

  return parsed;
};

const removeUploadedFile = async (req) => {
  if (req.file?.path) await fs.unlink(req.file.path).catch(() => {});
};

const removeRecipeImage = async (image) => {
  if (typeof image !== 'string') return;
  const match = /^\/uploads\/([^/?#]+)$/.exec(image);
  if (!match) return;

  let filename;
  try {
    filename = decodeURIComponent(match[1]);
  } catch {
    return;
  }
  if (path.basename(filename) !== filename) return;

  try {
    await fs.unlink(path.join(uploadsDirectory, filename));
  } catch (error) {
    if (error.code !== 'ENOENT') console.error('Không thể xóa ảnh công thức cũ.', error);
  }
};

const parseRecipeIngredients = (value) => {
  const allowedUnits = new Set(['g', 'ml', 'muỗng canh', 'muỗng cà phê']);
  return parseFormArray(value, 'ingredients').map((ingredient) => {
    const quantity = Number(ingredient?.quantity);
    const unit = typeof ingredient?.unit === 'string' ? ingredient.unit.trim() : '';
    const name = typeof ingredient?.name === 'string' ? ingredient.name.trim() : '';

    if (!name || !Number.isFinite(quantity) || quantity <= 0 || !allowedUnits.has(unit)) {
      throw createBadRequest('Mỗi nguyên liệu cần có tên, số lượng dương và đơn vị hợp lệ.');
    }

    return { name, quantity, unit };
  });
};

const parseRecipeSteps = (value) => parseFormArray(value, 'steps').map((step) => {
  const title = typeof step?.title === 'string' ? step.title.trim() : '';
  const instruction = typeof step?.instruction === 'string'
    ? step.instruction.trim()
    : '';
  const duration = Number(step?.duration);

  if (!title || !instruction || !Number.isInteger(duration) || duration <= 0) {
    throw createBadRequest('Mỗi bước cần có tiêu đề, hướng dẫn và thời gian dương.');
  }

  return { title, duration, instruction };
});

const parseRecipeEquipment = (value, optional = false) => {
  const equipment = parseFormArray(value, 'equipment', optional);
  if (!equipment.every((item) => typeof item === 'string' && item.trim())) {
    throw createBadRequest('equipment phải là mảng tên dụng cụ dạng chuỗi.');
  }
  return equipment.map((item) => item.trim());
};

const parsePositiveIntegerField = (value, fieldName) => {
  const number = Number(value);
  if (!Number.isInteger(number) || number <= 0) {
    throw createBadRequest(`${fieldName} phải là số nguyên dương.`);
  }
  return number;
};

// attachUser đã xác minh định danh và role từ users.json.
const authorizeRecipeMutation = (req, recipe) => {
  if (!req.user) {
    return { status: 401, message: 'Vui lòng cung cấp userId.' };
  }

  if (req.user.role !== 'admin' && String(recipe.authorId) !== String(req.user.id)) {
    return {
      status: 403,
      message: 'Bạn không có quyền chỉnh sửa/xóa món ăn này'
    };
  }

  return null;
};

const getRecipes = async (req, res) => {
  try {
    const statusFilter = resolveStatusFilter(req);
    if (statusFilter.error) {
      return res.status(statusFilter.error.code).json({
        success: false,
        message: statusFilter.error.message
      });
    }

    const page = parsePositiveInteger(req.query.page, 1);
    const limit = parsePositiveInteger(req.query.limit, 10);
    const { search, category, maxTime, difficulty, ingredients, authorId } = req.query;

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

    const stringFilters = { search, category, difficulty, ingredients, authorId };
    if (Object.entries(stringFilters).some(
      ([, value]) => value !== undefined && typeof value !== 'string'
    )) {
      return res.status(400).json({
        success: false,
        message: 'Các bộ lọc tìm kiếm phải là chuỗi.'
      });
    }

    const maxCookingTime = parsePositiveInteger(maxTime, null);
    if (maxTime !== undefined && maxCookingTime === null) {
      return res.status(400).json({
        success: false,
        message: 'maxTime phải là số nguyên dương.'
      });
    }

    const recipes = await readJsonArray(recipesFile, 'recipes.json');
    const currentUser = req.user ?? null;

    const searchTerm = normalizeText(search?.trim() ?? '');
    const ingredientTerms = [...new Set(
      (ingredients ?? '')
        .split(',')
        .map((item) => normalizeText(item.trim()))
        .filter(Boolean)
    )];

    let filteredRecipes = recipes.filter((recipe) => {
      const recipeStatus = recipe.status || 'approved';
      const isOwner = currentUser
        && String(recipe.authorId) === String(currentUser.id);

      if (statusFilter.mode === 'admin') {
        if (statusFilter.status !== 'all' && recipeStatus !== statusFilter.status) {
          return false;
        }
      } else {
        const isVisible = recipeStatus === 'approved'
          || currentUser?.role === 'admin'
          || isOwner;
        if (!isVisible) return false;
      }

      if (authorId && String(recipe.authorId) !== authorId.trim()) return false;
      if (category && normalizeText(String(recipe.category ?? '')) !== normalizeText(category.trim())) {
        return false;
      }
      if (difficulty && normalizeText(String(recipe.difficulty ?? '')) !== normalizeText(difficulty.trim())) {
        return false;
      }
      if (maxCookingTime !== null && Number(recipe.cookingTime) > maxCookingTime) {
        return false;
      }

      const recipeIngredients = Array.isArray(recipe.ingredients)
        ? recipe.ingredients.map((item) => (
            typeof item === 'string' ? item : item?.name
          )).filter((name) => typeof name === 'string')
        : [];

      if (searchTerm) {
        const fields = [
          recipe.title,
          recipe.description,
          recipe.category,
          ...recipeIngredients
        ];
        const matchesSearch = fields.some(
          (field) => typeof field === 'string'
            && normalizeText(field).includes(searchTerm)
        );
        if (!matchesSearch) return false;
      }

      return true;
    });

    if (ingredientTerms.length > 0) {
      filteredRecipes = filteredRecipes
        .map((recipe) => {
          const recipeIngredients = Array.isArray(recipe.ingredients)
            ? recipe.ingredients.map((item) => (
                typeof item === 'string' ? item : item?.name
              )).filter((name) => typeof name === 'string')
            : [];
          const normalizedNames = recipeIngredients.map((name) => normalizeText(name));
          const matchCount = ingredientTerms.reduce((count, term) =>
            count + (normalizedNames.some((name) => name.includes(term)) ? 1 : 0), 0
          );

          return { ...recipe, matchCount };
        })
        .filter((recipe) => recipe.matchCount > 0)
        .sort((a, b) => {
          const countDifference = b.matchCount - a.matchCount;
          if (countDifference !== 0) return countDifference;

          const aCreatedAt = Date.parse(a.createdAt ?? '') || 0;
          const bCreatedAt = Date.parse(b.createdAt ?? '') || 0;
          return bCreatedAt - aCreatedAt;
        });
    }

    filteredRecipes = filteredRecipes.map((recipe) => ({
      ...withReviewStats(recipe),
      ...(recipe.matchCount === undefined ? {} : { matchCount: recipe.matchCount })
    }));

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

const getCategories = async (req, res) => {
  try {
    const categories = await readJsonArray(categoriesFile, 'categories.json');
    if (!categories.every((category) => typeof category === 'string' && category.trim())) {
      throw new Error('categories.json phải chứa danh sách tên loại món dạng chuỗi.');
    }

    return res.status(200).json({
      success: true,
      message: 'Lấy danh sách loại món thành công.',
      data: categories.map((category) => category.trim()).sort((a, b) => a.localeCompare(b, 'vi'))
    });
  } catch (error) {
    return sendServerError(res, 'Không thể đọc danh sách loại món.', error);
  }
};

const getRecipeById = async (req, res) => {
  try {
    const recipes = await readJsonArray(recipesFile, 'recipes.json');
    const recipe = recipes.find((item) => String(item.id) === req.params.id);

    const isVisible = recipe && (
      (recipe.status || 'approved') === 'approved'
      || req.user?.role === 'admin'
      || String(recipe.authorId) === String(req.user?.id)
    );

    if (!isVisible) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy công thức.'
      });
    }

    return res.status(200).json({
      success: true,
      data: withReviewStats(recipe, true)
    });
  } catch (error) {
    return sendServerError(res, 'Không thể đọc chi tiết công thức.', error);
  }
};

const createRecipe = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Vui lòng đăng nhập để đăng công thức.'
    });
  }

  try {
    const body = req.body;
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      throw createBadRequest('Dữ liệu công thức không hợp lệ.');
    }

    const title = typeof body.title === 'string' ? body.title.trim() : '';
    if (!title) throw createBadRequest('Tên món ăn là bắt buộc.');
    if (!req.file) throw createBadRequest('Vui lòng tải ảnh công thức lên.');
    if (body.description !== undefined && typeof body.description !== 'string') {
      throw createBadRequest('description phải là chuỗi.');
    }
    if (body.category !== undefined && (
      typeof body.category !== 'string' || !body.category.trim()
    )) {
      throw createBadRequest('category phải là chuỗi không rỗng.');
    }
    if (body.difficulty !== undefined && !['Dễ', 'Trung bình', 'Khó'].includes(body.difficulty)) {
      throw createBadRequest('difficulty phải là Dễ, Trung bình hoặc Khó.');
    }

    const cleanIngredients = parseRecipeIngredients(body.ingredients);
    const cleanSteps = parseRecipeSteps(body.steps);
    const equipment = parseRecipeEquipment(body.equipment, true);

    const cookingTime = body.cookingTime === undefined || body.cookingTime === ''
      ? cleanSteps.reduce((total, step) => total + step.duration, 0)
      : parsePositiveIntegerField(body.cookingTime, 'cookingTime');
    const servings = body.servings === undefined || body.servings === ''
      ? 4
      : parsePositiveIntegerField(body.servings, 'servings');
    const difficulty = body.difficulty || 'Dễ';

    const recipe = {
      id: `recipe-${crypto.randomUUID()}`,
      title,
      description: typeof body.description === 'string' ? body.description.trim() : '',
      image: `/uploads/${req.file.filename}`,
      category: typeof body.category === 'string' && body.category.trim()
        ? body.category.trim()
        : 'Món chính',
      cookingTime,
      servings,
      equipment,
      difficulty,
      ingredients: cleanIngredients,
      steps: cleanSteps,
      authorId: String(req.user.id),
      status: 'pending',
      reviews: [],
      averageRating: 0,
      createdAt: new Date().toISOString()
    };

    const recipes = await readJsonArray(recipesFile, 'recipes.json');
    recipes.push(recipe);
    await writeRecipes(recipes);

    return res.status(201).json({ success: true, data: recipe });
  } catch (error) {
    await removeUploadedFile(req);
    if (Number.isInteger(error.status) && error.status < 500) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    return sendServerError(res, 'Không thể tạo công thức.', error);
  }
};

const updateRecipe = async (req, res) => {
  try {
    const recipes = await readJsonArray(recipesFile, 'recipes.json');
    const index = recipes.findIndex((item) => String(item.id) === req.params.id);

    if (index === -1) {
      await removeUploadedFile(req);
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy công thức.'
      });
    }

    const authorizationError = authorizeRecipeMutation(req, recipes[index]);

    if (authorizationError) {
      await removeUploadedFile(req);
      return res.status(authorizationError.status).json({
        success: false,
        message: authorizationError.message
      });
    }

    const body = req.body ?? {};
    if (typeof body !== 'object' || Array.isArray(body)) {
      throw createBadRequest('Dữ liệu cập nhật không hợp lệ.');
    }
    const editableFields = new Set([
      'title', 'description', 'category', 'cookingTime', 'servings',
      'difficulty', 'ingredients', 'steps', 'equipment'
    ]);
    if (!Object.keys(body).some((key) => editableFields.has(key)) && !req.file) {
      throw createBadRequest('Không có dữ liệu cần cập nhật.');
    }

    const updated = { ...recipes[index] };
    if (body.title !== undefined) {
      const title = typeof body.title === 'string' ? body.title.trim() : '';
      if (!title) throw createBadRequest('Tên món ăn không được để trống.');
      updated.title = title;
    }
    if (body.description !== undefined) {
      if (typeof body.description !== 'string') {
        throw createBadRequest('description phải là chuỗi.');
      }
      updated.description = body.description.trim();
    }
    if (body.category !== undefined) {
      const category = typeof body.category === 'string' ? body.category.trim() : '';
      if (!category) throw createBadRequest('category không được để trống.');
      updated.category = category;
    }
    if (body.cookingTime !== undefined) {
      updated.cookingTime = parsePositiveIntegerField(body.cookingTime, 'cookingTime');
    }
    if (body.servings !== undefined) {
      updated.servings = parsePositiveIntegerField(body.servings, 'servings');
    }
    if (body.difficulty !== undefined) {
      if (!['Dễ', 'Trung bình', 'Khó'].includes(body.difficulty)) {
        throw createBadRequest('difficulty phải là Dễ, Trung bình hoặc Khó.');
      }
      updated.difficulty = body.difficulty;
    }
    if (body.ingredients !== undefined) {
      updated.ingredients = parseRecipeIngredients(body.ingredients);
    }
    if (body.steps !== undefined) updated.steps = parseRecipeSteps(body.steps);
    if (body.equipment !== undefined) {
      updated.equipment = parseRecipeEquipment(body.equipment, true);
    }
    const oldImage = recipes[index].image;
    if (req.file) updated.image = `/uploads/${req.file.filename}`;
    updated.status = 'pending';
    recipes[index] = updated;
    await writeRecipes(recipes);
    if (req.file && oldImage !== updated.image) await removeRecipeImage(oldImage);

    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    await removeUploadedFile(req);
    if (Number.isInteger(error.status) && error.status < 500) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
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
    const authorizationError = authorizeRecipeMutation(req, recipe);

    if (authorizationError) {
      return res.status(authorizationError.status).json({
        success: false,
        message: authorizationError.message
      });
    }

    recipes.splice(index, 1);
    await writeRecipes(recipes);
    await removeRecipeImage(recipe.image);

    return res.status(200).json({ success: true, data: recipe });
  } catch (error) {
    return sendServerError(res, 'Không thể xóa công thức.', error);
  }
};

module.exports = {
  getRecipes,
  getCategories,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe
};
