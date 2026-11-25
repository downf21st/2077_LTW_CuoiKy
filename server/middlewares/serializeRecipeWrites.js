const { acquireLock } = require('../utils/mutex');

// Dùng chung khóa với review, duyệt món và danh mục để tránh ghi đè dữ liệu.
const serializeRecipeWrites = async (req, res, next) => {
  try {
    const release = await acquireLock();
    let released = false;
    const releaseOnce = () => {
      if (released) return;
      released = true;
      release();
    };

    res.once('finish', releaseOnce);
    res.once('close', releaseOnce);
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = serializeRecipeWrites;
