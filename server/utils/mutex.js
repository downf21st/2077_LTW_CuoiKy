let tail = Promise.resolve();

const withLock = (task) => {
  const run = tail.then(task);
  tail = run.catch(() => {});
  return run;
};

module.exports = { withLock };