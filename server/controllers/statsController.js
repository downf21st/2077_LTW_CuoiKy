const fs = require('node:fs/promises');
const path = require('node:path');
const { getReviewStats } = require('../utils/reviewStats');

const dataDirectory = path.join(__dirname, '..', 'data');
const recipesFile = path.join(dataDirectory, 'recipes.json');
const usersFile = path.join(dataDirectory, 'users.json');

const readArray = async (filePath, fileName) => {
  const content = await fs.readFile(filePath, 'utf8');
  const value = JSON.parse(content.replace(/^\uFEFF/, ''));
  if (!Array.isArray(value)) throw new Error(`${fileName} phải chứa một mảng JSON.`);
  return value;
};

const getStats = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Vui lòng đăng nhập để tiếp tục.' });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Chỉ quản trị viên được xem thống kê.' });
  }

  try {
    const [recipes, users] = await Promise.all([
      readArray(recipesFile, 'recipes.json'),
      readArray(usersFile, 'users.json')
    ]);
    const approvedRecipes = recipes.filter((recipe) => (recipe.status || 'approved') === 'approved');
    const topRated = approvedRecipes.map((recipe) => ({
      id: recipe.id,
      title: recipe.title,
      image: recipe.image,
      ...getReviewStats(recipe.reviews)
    })).filter((recipe) => recipe.reviewCount > 0)
      .sort((a, b) => b.averageRating - a.averageRating || b.reviewCount - a.reviewCount)
      .slice(0, 5);

    return res.json({
      success: true,
      data: {
        totalRecipes: approvedRecipes.length,
        pendingRecipes: recipes.filter((recipe) => recipe.status === 'pending').length,
        totalUsers: users.length,
        totalReviews: recipes.reduce((total, recipe) => (
          total + (Array.isArray(recipe.reviews) ? recipe.reviews.length : 0)
        ), 0),
        topRated
      }
    });
  } catch (error) {
    console.error('getStats error:', error.message);
    return res.status(500).json({ success: false, message: 'Không thể tải thống kê.' });
  }
};

module.exports = { getStats };
