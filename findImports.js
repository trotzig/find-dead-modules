const path = require('path');

const babylon = require('babylon');
const requireRelative = require('require-relative');
const walk = require('babylon-walk');

const expandPath = require('./expandPath');
const readFile = require('./readFile');
const stripCwd = require('./stripCwd');

function parse(fileContent) {
  return babylon.parse(fileContent, {
    allowImportExportEverywhere: true,
    plugins: [
      'jsx',
      'flow',
      'typescript',
      'objectRestSpread',
      'decorators',
      'classProperties',
      'exportExtensions',
      'dynamicImport',
    ],
    sourceType: 'module',
  });
}

function fileToAst(file) {
  return new Promise((resolve, reject) => {
    readFile(file).then((fileContent) => {
      let normalizedContent = fileContent;
      if (/\.json|\.babelrc$/.test(file)) {
        // Make json parseable by babylon by assigning the json object to
        // something:
        normalizedContent = 'const _ = ' + fileContent;
      }
      try {
        resolve({ file, ast: parse(normalizedContent) });
      } catch (error) {
        console.error('Failed to parse', file);
        //reject(error);
        resolve({ file, ast: parse('') });
      }
    });
  });
}

const COULD_BE_PATH = /[a-zA-Z0-9-_\/]+\.js[a-z]*$/;

// Finds import statements in an ast (either commonjs ones using `require`, or
// es6 ones using `import from`).
function findModuleNames({ file, ast }) {
  const moduleNames = new Set();
  const ImportVisitor = {
    ImportDeclaration(node) {
      // import foo from 'bar'
      moduleNames.add(node.source.value);
    },

    StringLiteral(node) {
      const all = node.value.split(/\s/);
      all.forEach((value) => {
        if (COULD_BE_PATH.test(value)) {
          expandPath(value, file).forEach((expanded) => {
            moduleNames.add(expanded);
          });
        }
      });
    },

    ExpressionStatement(node) {
      // require('no-assignment');
      if (!node.expression.callee) {
        return;
      }
      if (node.expression.callee.name !== 'require') {
        return;
      }

      if (node.expression.arguments.length !== 1) {
        return;
      }
      moduleNames.add(node.expression.arguments[0].value);
    },

    VariableDeclaration(node) {
      // const foo = require('foo')
      if (!node.declarations || node.declarations.length > 1) {
        return;
      }

      const declaration = node.declarations[0];
      if (!declaration.init) {
        // e.g. `let foo;`
        return;
      }
      if (declaration.init.type !== 'CallExpression') {
        return;
      }

      if (declaration.init.callee.name !== 'require') {
        return;
      }

      if (declaration.init.arguments.length !== 1) {
        return;
      }

      if (declaration.init.arguments[0].type !== 'StringLiteral') {
        return;
      }
      moduleNames.add(declaration.init.arguments[0].value);
    },
  };

  walk.simple(ast, ImportVisitor);
  return { file, moduleNames: [...moduleNames] };
}

function normalizeModuleName(moduleName) {
  return moduleName.replace(/^.+\?.+\!/, '');
}

/**
 * Uses require.resolve to find the path to the module referenced by the module
 * name.
 */
function resolveModuleNames({ file, moduleNames }) {
  const absoluteFilePath = path.join(process.cwd(), file);
  return moduleNames.map(moduleName => {
    try {
      return stripCwd(requireRelative.resolve(
        normalizeModuleName(moduleName), path.dirname(file)));
    } catch (err) {
      // We should probably log this somewhere. At least we can hold on to the
      // moduleName.
      return moduleName;
    }
  });
}

module.exports = function findImports(file) {
  return fileToAst(file).then(findModuleNames).then(resolveModuleNames);
};
