const glob = require('glob');

module.exports = function findAllFiles() {
  return new Promise((resolve, reject) => {
    glob(
      '**/*.js*',
      {
        ignore: [
          '**/node_modules/**',
          '**/__tests__/**',
          '**/test/**',
          '**/test.js*',
          '**/__generated__/**',
          '**/__mocks__/**',
        ],
      },
      (err, files) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(files);
      }
    );
  });
};
