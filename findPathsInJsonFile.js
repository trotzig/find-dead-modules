const readFile = require('./readFile');

const COULD_BE_PATH = /\.js[a-z]*$/;

function normalizePath(filePath) {
  if (filePath.startsWith('./')) {
    return filePath.slice(2);
  }
  return filePath;
}

function findPathsIter(item, result = []) {
  if (typeof item === 'string' && COULD_BE_PATH.test(item)) {
    result.push(normalizePath(item));
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
    return findPathsIter(json);
  });
};
