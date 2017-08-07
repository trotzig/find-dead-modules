const expandPath = require('./expandPath');
const readFile = require('./readFile');

const COULD_BE_PATH = /\.js[a-z]*$/;

function findPathsIter(item, result = []) {
  if (typeof item === 'string' && COULD_BE_PATH.test(item)) {
    // Finds e.g.
    // 'src/foo.js'
    // 'node src/foo.js'
    const tokens = item.split(/\s/);
    result.push(tokens[tokens.length - 1]);
  }
  if (typeof item === 'object' && item !== null) {
    Object.keys(item).forEach((key) => findPathsIter(item[key], result));
  }
  if (Array.isArray(item)) {
    item.forEach((child) => findPathsIter(child, result));
  }
  return result;
}

module.exports = function findPathsInJsonFile(jsonFile) {
  return readFile(jsonFile).then((fileContent) => {
    const json = JSON.parse(fileContent);
    return findPathsIter(json)
      .map((path) => expandPath(path, jsonFile))
      .reduce((a, b) => a.concat(b), []);
  });
};
