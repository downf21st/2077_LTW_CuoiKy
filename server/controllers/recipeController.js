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
  if (value === undefined || value === null || value === '') {
    if (optional) return [];
    throw createBadRequest(`Thiếu trường ${fieldName}.`);
  }

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
      const isVisible = recipeStatus === 'approved'
        || currentUser?.role === 'admin'
        || isOwner;

      if (!isVisible) return false;
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
    const recipes = await readJsonArray(recipesFile, 'recipes.json');
    const categories = [...new Set(
      recipes
        .map((recipe) => (
          typeof recipe.category === 'string' ? recipe.category.trim() : ''
        ))
        .filter(Boolean)
    )].sort((a, b) => a.localeCompare(b, 'vi'));

    return res.status(200).json({
      success: true,
      message: 'Lấy danh sách loại món thành công.',
      data: categories
    });
  } catch (error) {
    return sendServerError(res, 'Không thể đọc danh sách loại món.', error);
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

    const ingredients = parseFormArray(body.ingredients, 'ingredients');
    const steps = parseFormArray(body.steps, 'steps');
    const equipment = parseFormArray(body.equipment, 'equipment', true);
    const allowedUnits = new Set(['g', 'ml', 'muỗng canh', 'muỗng cà phê']);

    const cleanIngredients = ingredients.map((ingredient) => {
      const quantity = Number(ingredient?.quantity);
      const unit = typeof ingredient?.unit === 'string' ? ingredient.unit.trim() : '';
      const name = typeof ingredient?.name === 'string' ? ingredient.name.trim() : '';

      if (!name || !Number.isFinite(quantity) || quantity <= 0 || !allowedUnits.has(unit)) {
        throw createBadRequest('Mỗi nguyên liệu cần có tên, số lượng dương và đơn vị hợp lệ.');
      }

      return { name, quantity, unit };
    });

    const cleanSteps = steps.map((step) => {
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

    if (!equipment.every((item) => typeof item === 'string' && item.trim())) {
      throw createBadRequest('equipment phải là mảng tên dụng cụ dạng chuỗi.');
    }

    const cookingTime = body.cookingTime === undefined || body.cookingTime === ''
      ? cleanSteps.reduce((total, step) => total + step.duration, 0)
      : Number(body.cookingTime);
    const servings = body.servings === undefined || body.servings === ''
      ? 4
      : Number(body.servings);
    const difficulty = body.difficulty || 'Dễ';

    if (!Number.isInteger(cookingTime) || cookingTime <= 0) {
      throw createBadRequest('cookingTime phải là số nguyên dương.');
    }
    if (!Number.isInteger(servings) || servings <= 0) {
      throw createBadRequest('servings phải là số nguyên dương.');
    }
    if (!['Dễ', 'Trung bình', 'Khó'].includes(difficulty)) {
      throw createBadRequest('difficulty phải là Dễ, Trung bình hoặc Khó.');
    }

    const recipes = await readJsonArray(recipesFile, 'recipes.json');
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
      equipment: equipment.map((item) => item.trim()),
      difficulty,
      ingredients: cleanIngredients,
      steps: cleanSteps,
      authorId: String(req.user.id),
      status: 'pending',
      reviews: [],
      averageRating: 0,
      createdAt: new Date().toISOString()
    };

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
  getCategories,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe
};
