const glob = require('glob');

module.exports = function findAllFiles() {
  return new Promise((resolve, reject) => {
    glob(
      '**/*.js*',
      {
        ignore: ['**/node_modules/**'],
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
