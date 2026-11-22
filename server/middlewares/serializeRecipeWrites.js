let writeQueue = Promise.resolve();

// Giữ tuần tự toàn bộ thao tác đọc-sửa-ghi công thức trong một tiến trình.
const serializeRecipeWrites = (req, res, next) => {
  const previousWrite = writeQueue;
  let releaseWrite;
  writeQueue = new Promise((resolve) => {
    releaseWrite = resolve;
  });

  previousWrite.then(() => {
    let released = false;
    const release = () => {
      if (released) return;
      released = true;
      releaseWrite();
    };

    res.once('finish', release);
    res.once('close', release);
    next();
  }).catch((error) => {
    releaseWrite();
    next(error);
  });
};

module.exports = serializeRecipeWrites;
