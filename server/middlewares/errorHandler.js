const notFound = (req, res) => res.status(404).json({
  message: 'Không tìm thấy đường dẫn ' + req.method + ' ' + req.originalUrl + '.'
});

const errorHandler = (error, req, res, next) => {
  if (res.headersSent) return next(error);

  const status = Number.isInteger(error.status) ? error.status : 500;
  const message = error.type === 'entity.parse.failed'
    ? 'Nội dung JSON không hợp lệ.'
    : status >= 500
      ? 'Đã xảy ra lỗi máy chủ.'
      : error.message || 'Yêu cầu không hợp lệ.';

  if (status >= 500) console.error(error);
  return res.status(status).json({ message });
};

module.exports = { notFound, errorHandler };