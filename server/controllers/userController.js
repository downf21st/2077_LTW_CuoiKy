const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');
const { promisify } = require('node:util');

const scrypt = promisify(crypto.scrypt);
const usersFile = path.join(__dirname, '..', 'data', 'users.json');
const writeQueue = { current: Promise.resolve() };

const readUsers = async () => {
  const content = await fs.readFile(usersFile, 'utf8');
  const users = JSON.parse(content.replace(/^\uFEFF/, ''));

  if (!Array.isArray(users)) {
    throw new Error('users.json phải chứa một mảng JSON.');
  }

  return users;
};

const writeUsers = async (users) => {
  const tempFile = path.join(
    path.dirname(usersFile),
    '.users-' + crypto.randomUUID() + '.tmp'
  );

  try {
    await fs.writeFile(tempFile, JSON.stringify(users, null, 2) + '\n', 'utf8');
    await fs.rename(tempFile, usersFile);
  } catch (error) {
    await fs.unlink(tempFile).catch(() => {});
    throw error;
  }
};

const hashPassword = async (password) => {
  const salt = crypto.randomBytes(16);
  const derivedKey = await scrypt(password, salt, 64, {
    N: 16384,
    r: 8,
    p: 1,
    maxmem: 64 * 1024 * 1024
  });

  return [
    'scrypt',
    '16384',
    '8',
    '1',
    salt.toString('hex'),
    derivedKey.toString('hex')
  ].join('$');
};

const verifyPassword = async (password, passwordHash) => {
  const parts = typeof passwordHash === 'string' ? passwordHash.split('$') : [];
  if (parts.length !== 6 || parts[0] !== 'scrypt') return false;

  const [, nText, rText, pText, saltHex, hashHex] = parts;
  const N = Number(nText);
  const r = Number(rText);
  const p = Number(pText);
  const expected = Buffer.from(hashHex, 'hex');
  const salt = Buffer.from(saltHex, 'hex');

  if (
    !Number.isSafeInteger(N) || N < 2 || N > 262144 || (N & (N - 1)) !== 0
    || !Number.isSafeInteger(r) || r < 1 || r > 16
    || !Number.isSafeInteger(p) || p < 1 || p > 4
    || expected.length === 0 || salt.length === 0
  ) {
    return false;
  }

  const actual = await scrypt(password, salt, expected.length, {
    N,
    r,
    p,
    maxmem: 64 * 1024 * 1024
  });

  return actual.length === expected.length
    && crypto.timingSafeEqual(actual, expected);
};

const publicUser = (user) => ({
  id: user.id,
  name: user.fullName,
  fullName: user.fullName,
  username: user.username,
  email: user.email,
  role: user.role,
  bio: user.bio ?? '',
  avatar: user.avatarUrl ?? null
});

const login = async (req, res, next) => {
  try {
    const email = typeof req.body?.email === 'string'
      ? req.body.email.trim().toLowerCase()
      : '';
    const password = typeof req.body?.password === 'string'
      ? req.body.password
      : '';

    if (!email || !password) {
      return res.status(400).json({ message: 'Vui lòng nhập email và mật khẩu.' });
    }

    const users = await readUsers();
    const user = users.find((item) =>
      typeof item.email === 'string' && item.email.toLowerCase() === email
    );

    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng.' });
    }

    return res.status(200).json(publicUser(user));
  } catch (error) {
    return next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const update = writeQueue.current.then(async () => {
      if (String(req.params.id) !== String(req.user.id)) {
        const error = new Error('Bạn không có quyền cập nhật hồ sơ này.');
        error.status = 403;
        throw error;
      }

      const users = await readUsers();
      const index = users.findIndex((user) => String(user.id) === String(req.user.id));
      if (index === -1) {
        const error = new Error('Không tìm thấy người dùng.');
        error.status = 404;
        throw error;
      }

      const body = req.body;
      if (!body || typeof body !== 'object' || Array.isArray(body)) {
        const error = new Error('Dữ liệu cập nhật không hợp lệ.');
        error.status = 400;
        throw error;
      }

      const editableFields = ['name', 'fullName', 'username', 'bio', 'avatar', 'avatarUrl'];
      if (!editableFields.some((field) => Object.hasOwn(body, field))) {
        const error = new Error('Không có thông tin hồ sơ cần cập nhật.');
        error.status = 400;
        throw error;
      }

      const updated = { ...users[index] };
      const name = body.fullName ?? body.name;
      if (name !== undefined) {
        if (typeof name !== 'string' || !name.trim() || name.trim().length > 60) {
          const error = new Error('Tên hiển thị phải có từ 1 đến 60 ký tự.');
          error.status = 400;
          throw error;
        }
        updated.fullName = name.trim();
      }

      if (body.username !== undefined) {
        const username = typeof body.username === 'string'
          ? body.username.trim().replace(/^@+/, '')
          : '';
        if (!/^[a-zA-Z0-9._-]{2,31}$/.test(username)) {
          const error = new Error('Tên người dùng phải có từ 2 đến 31 ký tự hợp lệ.');
          error.status = 400;
          throw error;
        }
        if (users.some((user, userIndex) => userIndex !== index
          && typeof user.username === 'string'
          && user.username.replace(/^@+/, '').toLowerCase() === username.toLowerCase())) {
          const error = new Error('Tên người dùng này đã được sử dụng.');
          error.status = 409;
          throw error;
        }
        updated.username = username;
      }

      if (body.bio !== undefined) {
        if (typeof body.bio !== 'string' || body.bio.length > 500) {
          const error = new Error('Giới thiệu phải là chuỗi và không vượt quá 500 ký tự.');
          error.status = 400;
          throw error;
        }
        updated.bio = body.bio.trim();
      }

      const avatar = body.avatar !== undefined ? body.avatar : body.avatarUrl;
      if (avatar !== undefined) {
        const isEmpty = avatar === null || avatar === '';
        const isDataUrl = typeof avatar === 'string'
          && avatar.length <= 500_000
          && /^data:image\/(?:jpeg|png|webp|gif);base64,[A-Za-z0-9+/]+={0,2}$/.test(avatar);
        const isHttpUrl = typeof avatar === 'string'
          && avatar.length <= 500_000
          && /^https?:\/\//i.test(avatar);
        const isLocalUpload = typeof avatar === 'string'
          && avatar.length <= 500_000
          && /^\/uploads\/[a-zA-Z0-9._-]+$/.test(avatar);
        if (!isEmpty && !isDataUrl && !isHttpUrl && !isLocalUpload) {
          const error = new Error('Ảnh đại diện không hợp lệ hoặc vượt quá giới hạn dung lượng.');
          error.status = 400;
          throw error;
        }
        updated.avatarUrl = isEmpty ? null : avatar;
      }

      users[index] = updated;
      await writeUsers(users);
      return updated;
    });

    writeQueue.current = update.then(() => undefined, () => undefined);
    const user = await update;
    return res.status(200).json({ success: true, data: publicUser(user) });
  } catch (error) {
    return next(error);
  }
};

const register = async (req, res, next) => {
  try {
    const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
    const email = typeof req.body?.email === 'string'
      ? req.body.email.trim().toLowerCase()
      : '';
    const password = typeof req.body?.password === 'string'
      ? req.body.password
      : '';

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Vui lòng nhập tên, email và mật khẩu.' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Email không hợp lệ.' });
    }

    const registration = writeQueue.current.then(async () => {
      const users = await readUsers();
      if (users.some((user) =>
        typeof user.email === 'string' && user.email.toLowerCase() === email
      )) {
        const error = new Error('Email này đã được đăng ký.');
        error.status = 409;
        throw error;
      }

      const nextNumber = users.reduce((max, user) => {
        const match = /^user-(\d+)$/.exec(String(user.id));
        return match ? Math.max(max, Number(match[1])) : max;
      }, 0) + 1;
      const id = 'user-' + String(nextNumber).padStart(3, '0');
      const username = email.split('@')[0];
      const user = {
        id,
        fullName: name,
        username,
        email,
        role: 'member',
        bio: '',
        avatarUrl: null,
        passwordHash: await hashPassword(password)
      };

      await writeUsers([...users, user]);
      return user;
    });

    writeQueue.current = registration.then(() => undefined, () => undefined);
    const user = await registration;
    return res.status(201).json(publicUser(user));
  } catch (error) {
    return next(error);
  }
};

module.exports = { login, register, updateProfile, hashPassword, verifyPassword };
