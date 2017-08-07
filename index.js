const findAllFiles = require('./findAllFiles');
const findAllImports = require('./findAllImports');

require.extensions['.jsx'] = function(content, filename) {
  return content;
};

findAllFiles()
  .then(findAllImports)
  .then(({ files, imports }) => {
    const diffs = files
      .filter(x => !imports.has(x))
      .filter(x => !/package\.json/.test(x))
      .filter(x => !/.babelrc/.test(x));

    if (diffs.length) {
      console.log([...diffs].join('\n'));
      process.exit(1);
    }
  })
  .catch(error => {
    console.log('Error caught', error);
    process.exit(1);
  });
