const path = require('path');

module.exports = function (options, webpack) {
  return {
    ...options,
    resolve: {
      ...options.resolve,
      symlinks: true,
      // Add backend's node_modules to resolution path so shared contexts can find dependencies
      modules: [
        path.resolve(__dirname, 'node_modules'),
        'node_modules',
      ],
      alias: {
        ...options.resolve?.alias,
        // Map shared contexts path
        '@shared/contexts': path.resolve(__dirname, '../../../shared/contexts'),
      },
    },
  };
};
