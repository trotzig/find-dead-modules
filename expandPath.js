const path = require('path');

const stripCwd = require('./stripCwd');

module.exports = function expandPath(filePath, relativeTo) {
  const result = [
    filePath,
    path.resolve(path.dirname(relativeTo), filePath),
  ];
  return result.map(stripCwd);
}
