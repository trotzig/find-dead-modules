const glob = require('glob');

module.exports = function findAllFiles() {
  return new Promise((resolve, reject) => {
    glob(
      '**/@(*.js|*.jsx|*.json|*.ts|*.tsx)',
      {
        ignore: [
          '**/node_modules/**',
          '**/dist/**',
          '**/build/**',
          '**/tmp/**',
          '**/config/**',
          '**/spec/**',
          '**/__tests__/**',
          '**/test/**',
          '**/test.js*',
          '**/index-test.js*',
          '**/index-examples.js*',
          '**/index-messages.js*',
          '**/__generated__/**',
          '**/__mocks__/**',
        ],
      },
      (err, files) => {
        if (err) {
          reject(err);
          return;
        }
        glob('**/.babelrc', {
          ignore: ['**/node_modules/**'],
        }, (err2, babelRcFiles) => {
          if (err2) {
            reject(err2);
            return;
          }
          resolve(files.concat(babelRcFiles));
        });
      }
    );
  });
};
