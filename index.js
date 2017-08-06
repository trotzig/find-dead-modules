const findAllFiles = require('./findAllFiles');
const findAllImports = require('./findAllImports');

findAllFiles()
  .then(findAllImports)
  .then(({ files, imports }) => {
    const difference = files.filter(x => !imports.has(x));
    if (difference.length) {
      console.log([...difference].join('\n'));
      process.exit(1);
    }
  })
  .catch(error => {
    console.log('Error caught', error);
    process.exit(1);
  });
