const fs = require('node:fs/promises');
const path = require('node:path');

const usersFile = path.join(__dirname, '..', 'data', 'users.json');

const attachUser = async (req, res, next) => {
  const userId = req.get('x-user-id')?.trim();

  if (!userId) {
    req.user = null;
    return next();
  }

  try {
    const content = await fs.readFile(usersFile, 'utf8');
    const users = JSON.parse(content.replace(/^\uFEFF/, ''));

    if (!Array.isArray(users)) {
      throw new Error('users.json phải chứa một mảng JSON.');
    }

    const user = users.find((item) => String(item.id) === userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Không tìm thấy người dùng.'
      });
    }

    req.user = {
      id: user.id,
      name: user.fullName,
      email: user.email,
      role: user.role
    };

    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = attachUser;