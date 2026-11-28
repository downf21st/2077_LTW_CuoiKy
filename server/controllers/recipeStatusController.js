const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');
const { calcRatingStats } = require('../utils/ratings');
const { withLock } = require('../utils/mutex');

const recipesFile = path.join(__dirname, '..', 'data', 'recipes.json');
const SETTABLE_STATUSES = ['approved', 'rejected'];
const LIST_STATUSES = ['pending', 'approved', 'rejected', 'all'];
const MAX_REJECTION_REASON_LENGTH = 100;
const MAX_REJECTION_NOTE_LENGTH = 500;

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

// PUT /api/recipes/:id/status (chỉ admin)
const updateRecipeStatus = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Bạn cần đăng nhập' });
    }
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Chỉ quản trị viên mới được duyệt món' });
    }

    const status = typeof req.body?.status === 'string' ? req.body.status.trim() : '';
    if (!SETTABLE_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: 'Trạng thái phải là "approved" hoặc "rejected"' });
    }

    let rejectionReason;
    let rejectionNote = '';
    if (status === 'rejected') {
      rejectionReason = typeof req.body.rejectionReason === 'string'
        ? req.body.rejectionReason.trim()
        : '';
      if (!rejectionReason || rejectionReason.length > MAX_REJECTION_REASON_LENGTH) {
        return res.status(400).json({
          message: `rejectionReason là bắt buộc và tối đa ${MAX_REJECTION_REASON_LENGTH} ký tự khi từ chối món`
        });
      }
      if (req.body.rejectionNote !== undefined && typeof req.body.rejectionNote !== 'string') {
        return res.status(400).json({ success: false, message: 'rejectionNote phải là chuỗi ký tự' });
      }
      rejectionNote = (req.body.rejectionNote || '').trim();
      if (rejectionNote.length > MAX_REJECTION_NOTE_LENGTH) {
        return res.status(400).json({
          message: `rejectionNote tối đa ${MAX_REJECTION_NOTE_LENGTH} ký tự`
        });
      }
    }
    const result = await withLock(async () => {
      const recipes = await readRecipes();
      const recipe = recipes.find((r) => String(r.id) === String(req.params.id));
      if (!recipe) {
        return { code: 404, body: { success: false, message: 'Không tìm thấy công thức' } };
      }

      recipe.status = status;
      if (status === 'rejected') {
        recipe.rejectionReason = rejectionReason;
        recipe.rejectionNote = rejectionNote;
      } else {
        delete recipe.rejectionReason;
        delete recipe.rejectionNote;
      }
      const stats = calcRatingStats(recipe.reviews);
      recipe.averageRating = stats.averageRating;
      recipe.reviewCount = stats.reviewCount;

      await writeRecipes(recipes);

      const { reviews, ...rest } = recipe;
      return { code: 200, body: { ...rest, ...stats } };
    });

    return res.status(result.code).json(result.body);
  } catch (error) {
    console.error('updateRecipeStatus error:', error.message);
    return res.status(500).json({ success: false, message: 'Không thể cập nhật trạng thái' });
  }
};

const resolveStatusFilter = (req) => {
  const raw = req.query.status;
  if (raw === undefined || raw === '') return { mode: 'default' };

  if (!req.user) {
    return { error: { code: 401, message: 'Bạn cần đăng nhập' } };
  }
  if (req.user.role !== 'admin') {
    return { error: { code: 403, message: 'Chỉ quản trị viên mới được lọc theo trạng thái' } };
  }

  const status = String(raw).trim().toLowerCase();
  if (!LIST_STATUSES.includes(status)) {
    return {
      error: { code: 400, message: 'status phải là pending, approved, rejected hoặc all' },
    };
  }
  return { mode: 'admin', status };
};

module.exports = { updateRecipeStatus, resolveStatusFilter };
