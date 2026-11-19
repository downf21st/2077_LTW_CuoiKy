const requireUser = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Vui lòng đăng nhập để đăng công thức.'
    });
  }

  return next();
};

module.exports = requireUser;
