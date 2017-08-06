const glob = require('glob');

glob('**/*.js*', {
  ignore: [
    '**/node_modules/**',
  ]
}, (er, files) => {
  console.log(files.join('\n'));
});
