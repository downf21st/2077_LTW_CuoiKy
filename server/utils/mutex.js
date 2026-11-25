let tail = Promise.resolve();

const acquireLock = async () => {
  let releaseCurrent;
  const previous = tail;
  tail = new Promise((resolve) => {
    releaseCurrent = resolve;
  });
  await previous;

  let released = false;
  return () => {
    if (released) return;
    released = true;
    releaseCurrent();
  };
};

const withLock = async (task) => {
  const release = await acquireLock();
  try {
    return await task();
  } finally {
    release();
  }
};

module.exports = { acquireLock, withLock };
