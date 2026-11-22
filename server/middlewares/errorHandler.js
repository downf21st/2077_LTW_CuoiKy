const notFound = (req, res) => res.status(404).json({
  success: false,
  message: 'Không tìm thấy đường dẫn ' + req.method + ' ' + req.originalUrl + '.'
});

const errorHandler = (error, req, res, next) => {
  if (res.headersSent) return next(error);

  const isMulterError = error.name === 'MulterError';
  const status = error.type === 'entity.parse.failed'
    ? 400
    : isMulterError && error.code === 'LIMIT_FILE_SIZE'
      ? 413
      : isMulterError
        ? 400
        : Number.isInteger(error.status) ? error.status : 500;
  const message = error.type === 'entity.parse.failed'
    ? 'Nội dung JSON không hợp lệ.'
    : isMulterError && error.code === 'LIMIT_FILE_SIZE'
      ? 'Ảnh tải lên không được vượt quá 2 MB.'
      : status >= 500
        ? 'Đã xảy ra lỗi máy chủ.'
        : error.message || 'Yêu cầu không hợp lệ.';

  if (status >= 500) console.error(error);
  return res.status(status).json({ success: false, message });
};

module.exports = { notFound, errorHandler };
