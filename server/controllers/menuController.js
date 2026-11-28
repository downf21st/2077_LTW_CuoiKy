const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');
const { withLock } = require('../utils/mutex');

const menusFile = path.join(__dirname, '..', 'data', 'menus.json');
const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const MEALS = ['breakfast', 'lunch', 'dinner'];

const emptyDays = () => Object.fromEntries(
  DAYS.map((day) => [day, Object.fromEntries(MEALS.map((meal) => [meal, []]))])
);

const readMenus = async () => {
  const content = await fs.readFile(menusFile, 'utf8');
  const menus = JSON.parse(content.replace(/^\uFEFF/, ''));
  if (!Array.isArray(menus)) throw new Error('menus.json phải chứa một mảng JSON.');
  return menus;
};

const writeMenus = async (menus) => {
  const tempFile = path.join(path.dirname(menusFile), `.menus-${crypto.randomUUID()}.tmp`);
  try {
    await fs.writeFile(tempFile, `${JSON.stringify(menus, null, 2)}\n`, 'utf8');
    await fs.rename(tempFile, menusFile);
  } catch (error) {
    await fs.unlink(tempFile).catch(() => {});
    throw error;
  }
};

const sendError = (res, error, fallback) => {
  if (Number.isInteger(error.status) && error.status < 500) {
    return res.status(error.status).json({ success: false, message: error.message });
  }
  console.error(fallback, error.message);
  return res.status(500).json({ success: false, message: fallback });
};

const httpError = (status, message) => Object.assign(new Error(message), { status });

const authorizeOwner = (req, res) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Vui lòng đăng nhập để tiếp tục.' });
    return false;
  }
  if (String(req.user.id) !== String(req.params.userId)) {
    res.status(403).json({ success: false, message: 'Bạn không có quyền truy cập thực đơn này.' });
    return false;
  }
  return true;
};

const validateDays = (days) => {
  if (!days || typeof days !== 'object' || Array.isArray(days)
    || DAYS.some((day) => !Object.hasOwn(days, day))) {
    throw httpError(400, 'days phải có đủ 7 ngày trong tuần.');
  }

  const cleanDays = {};
  for (const day of DAYS) {
    const slots = days[day];
    if (!slots || typeof slots !== 'object' || Array.isArray(slots)
      || MEALS.some((meal) => !Array.isArray(slots[meal]))) {
      throw httpError(400, `Dữ liệu các bữa của ngày ${day} không hợp lệ.`);
    }

    cleanDays[day] = {};
    for (const meal of MEALS) {
      cleanDays[day][meal] = slots[meal].map((item) => {
        if (!item || typeof item !== 'object' || Array.isArray(item)
          || typeof item.uid !== 'string' || !item.uid.trim()
          || !['string', 'number'].includes(typeof item.recipeId)
          || (typeof item.recipeId === 'string' && !item.recipeId.trim())
          || typeof item.title !== 'string' || !item.title.trim()
          || !Array.isArray(item.ingredients)
          || item.ingredients.some((ingredient) => !ingredient || typeof ingredient !== 'object' || Array.isArray(ingredient))) {
          throw httpError(400, 'Mỗi món trong thực đơn cần có uid, recipeId, title và ingredients hợp lệ.');
        }
        const cleanItem = {
          uid: item.uid.trim(),
          recipeId: item.recipeId,
          title: item.title.trim(),
          ingredients: item.ingredients
        };
        if (typeof item.image === 'string') cleanItem.image = item.image;
        return cleanItem;
      });
    }
  }
  return cleanDays;
};

const getMenu = async (req, res) => {
  if (!authorizeOwner(req, res)) return;
  try {
    const menus = await readMenus();
    const weekKey = req.query.weekKey;
    const menu = menus.find((item) =>
      String(item.userId) === String(req.params.userId) &&
      (weekKey ? String(item.weekKey) === String(weekKey) : true),
    );
    return res.json({
      success: true,
      data: menu || { userId: req.user.id, updatedAt: new Date().toISOString(), days: emptyDays() }
    });
  } catch (error) {
    return sendError(res, error, 'Không thể đọc thực đơn.');
  }
};

const saveMenu = async (req, res) => {
  if (!authorizeOwner(req, res)) return;
  try {
    const days = validateDays(req.body?.days);
    const weekKey = req.body?.weekKey;
    const menu = await withLock(async () => {
      const menus = await readMenus();
      const saved = {
        userId: req.user.id,
        weekKey,
        updatedAt: new Date().toISOString(),
        days,
      };
      const index = menus.findIndex((item) =>
        String(item.userId) === String(req.params.userId) &&
        (weekKey ? String(item.weekKey) === String(weekKey) : true),
      );
      if (index === -1) menus.push(saved);
      else menus[index] = saved;
      await writeMenus(menus);
      return saved;
    });
    return res.status(200).json({ success: true, data: menu });
  } catch (error) {
    return sendError(res, error, 'Không thể lưu thực đơn.');
  }
};

const deleteMenu = async (req, res) => {
  if (!authorizeOwner(req, res)) return;
  try {
    const weekKey = req.query.weekKey;
    await withLock(async () => {
      const menus = await readMenus();
      const remaining = menus.filter((item) => {
        const sameUser = String(item.userId) === String(req.params.userId);
        const sameWeek = weekKey ? String(item.weekKey) === String(weekKey) : true;
        return !(sameUser && sameWeek);
      });
      if (remaining.length !== menus.length) await writeMenus(remaining);
    });
    return res.status(204).end();
  } catch (error) {
    return sendError(res, error, 'Không thể xóa thực đơn.');
  }
};

module.exports = { getMenu, saveMenu, deleteMenu };
