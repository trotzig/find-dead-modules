const path = require('path');

const babylon = require('babylon');
const requireRelative = require('require-relative');
const walk = require('babylon-walk');

const findPathsInJsonFile = require('./findPathsInJsonFile');
const readFile = require('./readFile');
const stripCwd = require('./stripCwd');

function parse(fileContent) {
  return babylon.parse(fileContent, {
    allowImportExportEverywhere: true,
    plugins: [
      'jsx',
      'flow',
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
      try {
        resolve({ file, ast: parse(fileContent) });
      } catch (error) {
        reject(error);
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
      if (COULD_BE_PATH.test(node.value)) {
        moduleNames.add(node.value);
      }
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
      console.warn('FAILED TO RESOLVE', moduleName);
    }
  });
}

module.exports = function findImports(file) {
  if (/\.json|\.babelrc$/.test(file)) {
    return Promise.resolve(findPathsInJsonFile(file));
  }
  return fileToAst(file).then(findModuleNames).then(resolveModuleNames);
};
