const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');
const multer = require('multer');

const uploadDirectory = path.join(__dirname, '..', 'public', 'uploads');
const allowedTypes = new Map([
  ['.jpg', 'image/jpeg'],
  ['.png', 'image/png']
]);

const storage = multer.diskStorage({
  destination: async (req, file, callback) => {
    try {
      await fs.mkdir(uploadDirectory, { recursive: true });
      callback(null, uploadDirectory);
    } catch (error) {
      callback(error);
    }
  },
  filename: (req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const safeName = path.basename(file.originalname, path.extname(file.originalname))
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80) || 'recipe-image';

    callback(null, `${Date.now()}-${crypto.randomUUID()}-${safeName}${extension}`);
  }
});

const fileFilter = (req, file, callback) => {
  const extension = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.get(extension) !== file.mimetype) {
    const error = new Error('Chỉ chấp nhận ảnh JPG hoặc PNG.');
    error.status = 415;
    return callback(error);
  }

  return callback(null, true);
};

module.exports = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024,
    files: 1,
    fields: 20
  }
});
