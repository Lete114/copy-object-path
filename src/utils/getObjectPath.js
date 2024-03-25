const parser = require('@babel/parser')
const traverse = require('@babel/traverse').default

// eslint-disable-next-line max-statements
function getPath(path) {
  const OP = 'ObjectProperty'
  const OE = 'ObjectExpression'
  const AE = 'ArrayExpression'
  const VD = 'VariableDeclarator'
  const NE = 'NewExpression'
  const CE = 'CallExpression'

  if (path.type === OP && path.parent.type === OE) {
    return getPath(path.parentPath)
  }
  if (path.type === OE && path.parent.type === OP) {
    return getPath(path.parentPath) + '.' + path.parent.key.name
  }
  // Array index
  if (path.type === OE && path.parent.type === AE) {
    return `${getPath(path.parentPath)}[${path.key}]`
  }
  if (path.type === AE && path.parent.type === OP) {
    return getPath(path.parentPath) + '.' + path.parent.key.name
  }

  // function call
  /* example
  const test = {
    name: 'Lete114',
    age: 18,
    other: {} // 👈 this "other"
  }
  */
  if (path.type === OE && path.parent.type === VD) {
    return path.parent.id.name
  }

  // new operator
  /* example
  const test = new Fun({
    name: 'Lete114',
    age: 18
  })
  */
  if (path.type === OE && path.parent.type === NE) {
    return getPath(path.parentPath)
  }
  if (path.type === NE && path.parent.type === VD) {
    return path.parent.id.name
  }

  // function call
  /* example
  const test = fun({
    name: 'Lete114',
    age: 18
  })
  */
  if (path.type === OE && path.parent.type === CE) {
    return getPath(path.parentPath)
  }
  if (path.type === CE && path.parent.type === VD) {
    return path.parent.id.name
  }
}

/**
 *
 * @param { string } code
 * @param { number } row
 * @param { number= } column
 * @param { boolean= } isFinally
 * @returns
 */
module.exports = function getObjectPath(code, row, column, isFinally) {
  const ast = parser.parse(code, {
    sourceType: 'module',
    plugins: ['typescript']
  })

  let path = ''
  // @ts-ignore
  traverse(ast, {
    enter({ node, parentPath }) {
      const isNodeValid = node.loc && node.loc.start.line === row
      const isColumnInRange =
        typeof column === 'undefined' ||
        (node.loc.start.column <= column && node.loc.end.column >= column)

      if (isNodeValid && isColumnInRange) {
        if (node.type === 'Identifier' && parentPath.type !== 'ObjectMethod') {
          // @ts-ignore
          path = getPath(parentPath) + '.' + node.name
        }

        // @ts-ignore
        if (node.key && node.key.type === 'Identifier') {
          // @ts-ignore
          path = getPath(parentPath) + '.' + node.key.name
        }

        /* example
        const map = { other: 'other' }
        const test = {
          name: 'Lete114',
          age: 18,
          [map.other]: {} // 👈 this "map.other"
        }
        */
        // @ts-ignore
        if (node.key && node.key.type === 'CallExpression') {
          path = getPath(parentPath)
        }
      }
    }
  })
  // Whether or not to end it directly
  if (isFinally) return path
  // If the path cannot be found using both rows and columns
  // cancel the columns and use only the rows to find it
  return path || getObjectPath(code, row, void 0, true)
}
