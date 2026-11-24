const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');
const { calcRatingStats } = require('../utils/ratings');
const { withLock } = require('../utils/mutex');

const recipesFile = path.join(__dirname, '..', 'data', 'recipes.json');
const MAX_COMMENT_LENGTH = 500;

const readRecipes = async () => {
  const content = await fs.readFile(recipesFile, 'utf8');
  const data = JSON.parse(content.replace(/^\uFEFF/, ''));
  if (!Array.isArray(data)) {
    throw new Error('recipes.json phải chứa một mảng JSON.');
  }
  return data;
};

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

// POST /api/recipes/:id/reviews
const createReview = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Bạn cần đăng nhập để đánh giá' });
    }

    const { rating, comment } = req.body || {};

    if (typeof rating !== 'number' || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Số sao phải là số nguyên từ 1 đến 5' });
    }

    if (comment !== undefined && comment !== null && typeof comment !== 'string') {
      return res.status(400).json({ message: 'Bình luận phải là chuỗi ký tự' });
    }

    const cleanComment = (comment ?? '').trim();
    if (cleanComment.length > MAX_COMMENT_LENGTH) {
      return res
        .status(400)
        .json({ message: `Bình luận tối đa ${MAX_COMMENT_LENGTH} ký tự` });
    }

    const result = await withLock(async () => {
      const recipes = await readRecipes();
      const recipe = recipes.find((r) => String(r.id) === String(req.params.id));

      if (!recipe || (recipe.status || 'approved') !== 'approved') {
        return { code: 404, body: { message: 'Không tìm thấy công thức' } };
      }

      const reviews = Array.isArray(recipe.reviews) ? recipe.reviews : [];

      const alreadyReviewed = reviews.some((r) => String(r.userId) === String(req.user.id));
      if (alreadyReviewed) {
        return { code: 400, body: { message: 'Bạn đã đánh giá món này rồi' } };
      }

      const review = {
        id: reviews.reduce((max, r) => Math.max(max, Number(r.id) || 0), 0) + 1,
        userId: req.user.id,
        userName: req.user.name || req.user.fullName || 'Người dùng',
        rating,
        comment: cleanComment,
        hidden: false,
        createdAt: new Date().toISOString(),
      };

      recipe.reviews = [...reviews, review];
      const stats = calcRatingStats(recipe.reviews);
      recipe.averageRating = stats.averageRating;
      recipe.reviewCount = stats.reviewCount;

      await writeRecipes(recipes);

      return {
        code: 201,
        body: {
          review,
          averageRating: stats.averageRating,
          reviewCount: stats.reviewCount,
        },
      };
    });

    return res.status(result.code).json(result.body);
  } catch (error) {
    console.error('createReview error:', error.message);
    return res.status(500).json({ message: 'Không thể lưu đánh giá, vui lòng thử lại' });
  }
};

module.exports = { createReview };