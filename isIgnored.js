const fs = require('fs');

const minimatch = require('minimatch');

const gitIgnores = (() => {
  return fs.readFileSync('.gitignore', 'utf-8').split('\n')
    .filter((line) => line.length && !/^!|#/.test(line));
})();

const defaultIgnores = [
  '**/package.json',
  '**/.babelrc',
  '**/webpack.*js',
  '**/lerna.json',
  '**/src/index.js',
];

const allIgnores = gitIgnores.concat(defaultIgnores);

module.exports = function isIgnored(path) {
  for (pattern of allIgnores) {
    if (minimatch(path, pattern)) {
      return true;
    }
  }
  return false;
};
