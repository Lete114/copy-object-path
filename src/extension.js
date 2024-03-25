const vscode = require('vscode')
const getObjectPath = require('./utils/getObjectPath')

// eslint-disable-next-line max-statements
function copyObjectPath() {
  try {
    const editor = vscode.window.activeTextEditor
    if (!editor) return

    const text = editor.document.getText()
    const selection = editor.selection
    const position = selection.active

    const { row, column } = {
      row: position.line + 1,
      column: position.character + 1
    }

    const languageId = editor.document.languageId;

    const languages = {
      typescript() { },
      vue() {
        const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gm;
        const match = scriptRegex.exec(text)
        if (!match) return

        const scriptContent = match[1].trim();
        const lineNumber = (text.substring(0, match.index).match(/\n/g) || []).length + 1;
        const line = '\n'.repeat(lineNumber)
        
        const code = line + scriptContent
        return code
      }
    }

    const code = (languages[languageId] && languages[languageId]()) || text

    const objectPath = getObjectPath(code, row, column)

    if (objectPath) {
      vscode.env.clipboard.writeText(objectPath)
      const msg = `Copied object path: "${objectPath}"`
      vscode.window.showInformationMessage(msg)
    } else {
      vscode.window.showErrorMessage('Unable to determine object path.')
    }
  } catch (error) {
    /* eslint-disable */
    console.error('No property selected.', error)
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

function deactivate() { }

module.exports = {
  activate,
  deactivate
}
