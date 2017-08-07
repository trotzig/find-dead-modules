module.exports = function stripCwd(filePath) {
  if (filePath.startsWith(process.cwd())) {
    return filePath.slice(process.cwd().length + 1);
  }
  return filePath;
}
