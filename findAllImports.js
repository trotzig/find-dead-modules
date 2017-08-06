const findImports = require('./findImports');

module.exports = function findAllImports(files) {
  return new Promise((resolve, reject) => {
    const promises = files.map(findImports);
    Promise.all(promises)
      .then(results => {
        const allImports = new Set();
        results.forEach(imports => {
          imports.forEach(imp => {
            allImports.add(imp);
          });
        });
        resolve({ files, imports: allImports });
      })
      .catch(reject);
  });
};
