const express = require('express');
const { getRecipeById } = require('../controllers/recipeController');
const fs = require('node:fs/promises');
const path = require('node:path');

const router = express.Router();
const recipesFile = path.join(__dirname, '..', 'data', 'recipes.json');
const maxPageSize = 100;

const parsePositiveInteger = (value, fallback) => {
  if (value === undefined) return fallback;
  if (typeof value !== 'string' || !/^\d+$/.test(value)) return null;

  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
};

const normalizeText = (value) => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/đ/g, 'd')
  .replace(/Đ/g, 'D')
  .toLowerCase();

router.get('/', async (req, res) => {
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

  try {
    const fileContent = await fs.readFile(recipesFile, 'utf8');
    const recipes = JSON.parse(fileContent.replace(/^\uFEFF/, ''));

    if (!Array.isArray(recipes)) {
      return res.status(500).json({
        success: false,
        message: 'Dữ liệu công thức không đúng định dạng mảng.'
      });
    }

    const searchTerm = normalizeText(searchQuery?.trim() ?? '');
    const filteredRecipes = searchTerm
      ? recipes.filter((recipe) => {
          const ingredientNames = Array.isArray(recipe.ingredients)
            ? recipe.ingredients.map((ingredient) =>
                typeof ingredient === 'string' ? ingredient : ingredient?.name
              )
            : [];
          const searchableFields = [
            recipe.title,
            recipe.description,
            recipe.category,
            ...ingredientNames
          ];

          return searchableFields.some(
            (field) => typeof field === 'string' && normalizeText(field).includes(searchTerm)
          );
        })
      : recipes;

    const totalItems = filteredRecipes.length;
    const totalPages = Math.ceil(totalItems / limit);
    const startIndex = (page - 1) * limit;
    const data = filteredRecipes.slice(startIndex, startIndex + limit);

    return res.status(200).json({
      success: true,
      message: 'Lấy danh sách công thức thành công.',
      count: totalItems,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages
      },
      data
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Không thể đọc danh sách công thức.',
      error: error.message
    });
  }
});

router.get('/:id', getRecipeById);

module.exports = router;
