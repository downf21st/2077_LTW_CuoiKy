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
      return res.status(401).json({ success: false, message: 'Bạn cần đăng nhập để đánh giá' });
    }

    const { rating, comment } = req.body || {};

    if (typeof rating !== 'number' || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Số sao phải là số nguyên từ 1 đến 5' });
    }

    if (comment !== undefined && comment !== null && typeof comment !== 'string') {
      return res.status(400).json({ success: false, message: 'Bình luận phải là chuỗi ký tự' });
    }

    const cleanComment = (comment ?? '').trim();
    if (cleanComment.length > MAX_COMMENT_LENGTH) {
      return res
        .status(400)
        .json({ success: false, message: `Bình luận tối đa ${MAX_COMMENT_LENGTH} ký tự` });
    }

    const result = await withLock(async () => {
      const recipes = await readRecipes();
      const recipe = recipes.find((r) => String(r.id) === String(req.params.id));

      if (!recipe || (recipe.status || 'approved') !== 'approved') {
        return { code: 404, body: { success: false, message: 'Không tìm thấy công thức' } };
      }

      const reviews = Array.isArray(recipe.reviews) ? recipe.reviews : [];

      const alreadyReviewed = reviews.find((r) => String(r.userId) === String(req.user.id));
      if (alreadyReviewed) {
        return { code: 400, body: { success: false, message: 'Bạn đã đánh giá món này rồi' } };
      }

      const review = {
        id: `review-${crypto.randomUUID()}`,
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
    return res.status(500).json({ success: false, message: 'Không thể lưu đánh giá, vui lòng thử lại' });
  }
};

const requireAdmin = (req, res) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Vui lòng đăng nhập để tiếp tục.' });
    return false;
  }
  if (req.user.role !== 'admin') {
    res.status(403).json({ success: false, message: 'Chỉ quản trị viên được quản lý đánh giá.' });
    return false;
  }
  return true;
};

const sendAdminError = (res, error, fallback) => {
  if (Number.isInteger(error.status) && error.status < 500) {
    return res.status(error.status).json({ success: false, message: error.message });
  }
  console.error(fallback, error.message);
  return res.status(500).json({ success: false, message: fallback });
};

// GET /api/reviews (chỉ admin)
const getAdminReviews = async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    let limit = 50;
    if (req.query.limit !== undefined) {
      limit = Number(req.query.limit);
      if (!Number.isInteger(limit) || limit < 1) {
        return res.status(400).json({ success: false, message: 'limit phải là số nguyên dương.' });
      }
    }

    let hiddenFilter;
    if (req.query.hidden !== undefined) {
      if (!['true', 'false'].includes(req.query.hidden)) {
        return res.status(400).json({ success: false, message: 'hidden phải là true hoặc false.' });
      }
      hiddenFilter = req.query.hidden === 'true';
    }

    const recipes = await readRecipes();
    const reviews = recipes.flatMap((recipe) => (
      (Array.isArray(recipe.reviews) ? recipe.reviews : []).map((review) => ({
        ...review,
        recipeId: recipe.id,
        recipeTitle: recipe.title
      }))
    )).filter((review) => hiddenFilter === undefined || Boolean(review.hidden) === hiddenFilter)
      .sort((a, b) => Date.parse(b.createdAt || '') - Date.parse(a.createdAt || ''))
      .slice(0, limit);

    return res.json({ success: true, data: reviews });
  } catch (error) {
    return sendAdminError(res, error, 'Không thể tải danh sách đánh giá.');
  }
};

// PUT /api/recipes/:id/reviews/:reviewId (chỉ admin)
const setReviewHidden = async (req, res) => {
  if (!requireAdmin(req, res)) return;
  if (typeof req.body?.hidden !== 'boolean') {
    return res.status(400).json({ success: false, message: 'hidden phải là true hoặc false.' });
  }

  try {
    const review = await withLock(async () => {
      const recipes = await readRecipes();
      const recipe = recipes.find((item) => String(item.id) === String(req.params.id));
      if (!recipe) throw Object.assign(new Error('Không tìm thấy công thức.'), { status: 404 });

      const reviews = Array.isArray(recipe.reviews) ? recipe.reviews : [];
      const reviewIndex = reviews.findIndex((item) => String(item.id) === String(req.params.reviewId));
      if (reviewIndex === -1) throw Object.assign(new Error('Không tìm thấy đánh giá.'), { status: 404 });

      const updatedReview = { ...reviews[reviewIndex], hidden: req.body.hidden };
      recipe.reviews = [...reviews];
      recipe.reviews[reviewIndex] = updatedReview;
      await writeRecipes(recipes);
      return updatedReview;
    });
    return res.json({ success: true, data: review });
  } catch (error) {
    return sendAdminError(res, error, 'Không thể cập nhật đánh giá.');
  }
};
module.exports = { createReview, getAdminReviews, setReviewHidden };
