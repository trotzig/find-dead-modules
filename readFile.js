const fs = require('fs');

module.exports = function readFile(file) {
  return new Promise((resolve, reject) => {
    fs.readFile(file, 'utf8', (err, fileContent) => {
      if (err) {
        reject(new Error(err));
        return;
      }
      resolve(fileContent);
    });
  });
};
