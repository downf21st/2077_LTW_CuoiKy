const fs = require('node:fs/promises');
const path = require('node:path');

const recipesFile = path.join(__dirname, '..', 'data', 'recipes.json');

const getRecipeById = async (req, res) => {
  try {
    const fileContent = await fs.readFile(recipesFile, 'utf8');
    const recipes = JSON.parse(fileContent.replace(/^\uFEFF/, ''));

    if (!Array.isArray(recipes)) {
      return res.status(500).json({
        success: false,
        message: 'Dữ liệu công thức không đúng định dạng mảng.'
      });
    }

    const recipe = recipes.find((item) => String(item.id) === req.params.id);

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy công thức.'
      });
    }

    return res.status(200).json({
      success: true,
      data: recipe
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Không thể đọc chi tiết công thức.',
      error: error.message
    });
  }
};

module.exports = { getRecipeById };
