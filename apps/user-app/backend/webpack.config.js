module.exports = function (options, webpack) {
  return {
    ...options,
    resolve: {
      ...options.resolve,
      symlinks: true,
    },
  };
};
