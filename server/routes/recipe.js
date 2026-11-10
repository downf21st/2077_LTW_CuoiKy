const express = require('express');
const fs = require('node:fs/promises');
const path = require('node:path');

const router = express.Router();
const recipesFile = path.join(__dirname, '..', 'data', 'recipes.json');

router.get('/', async (req, res) => {
  try {
    const fileContent = await fs.readFile(recipesFile, 'utf8');
    const recipes = JSON.parse(fileContent.replace(/^\uFEFF/, ''));

    if (!Array.isArray(recipes)) {
      return res.status(500).json({
        success: false,
        message: 'Dữ liệu công thức không đúng định dạng mảng.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Lấy danh sách công thức thành công.',
      count: recipes.length,
      data: recipes
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Không thể đọc danh sách công thức.',
      error: error.message
    });
  }
});

module.exports = router;
