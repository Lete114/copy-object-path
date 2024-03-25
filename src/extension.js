const vscode = require('vscode')
const getObjectPath = require('./utils/getObjectPath')

// eslint-disable-next-line max-statements
function copyObjectPath() {
  try {
    const editor = vscode.window.activeTextEditor
    const text = editor.document.getText()
    if (!editor) return

    const selection = editor.selection
    const position = selection.active

    const { row, column } = {
      row: position.line + 1,
      column: position.character + 1
    }

    const objectPath = getObjectPath(text, row, column)

    if (objectPath) {
      vscode.env.clipboard.writeText(objectPath)
      const msg = `Copied object path: "${objectPath}"`
      vscode.window.showInformationMessage(msg)
    } else {
      vscode.window.showErrorMessage('Unable to determine object path.')
    }
  } catch (error) {
    /* eslint-disable */
    console.error('No property selected.',error)
    vscode.window.showErrorMessage('No property selected.')
    /* eslint-enable */
  }
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  const command = 'copy-object-path.copyObjectPath'
  let disposable = vscode.commands.registerCommand(command, copyObjectPath)
  context.subscriptions.push(disposable)
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
}
