"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
function activate(context) {
    // Register the custom view
    const provider = new DeepSeekChatViewProvider(context);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider('deepseekChatView', provider));
    // Register the command to open the chat
    context.subscriptions.push(vscode.commands.registerCommand('deepseek.openChat', () => {
        vscode.commands.executeCommand('workbench.view.extension.deepseekWeb');
    }));
    // Command to send selected code to DeepSeek Chat
    context.subscriptions.push(vscode.commands.registerCommand('deepseek.sendCode', () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const selection = editor.document.getText(editor.selection);
            vscode.commands.executeCommand('workbench.view.extension.deepseekWeb');
            provider.injectCode(selection);
            vscode.window.showInformationMessage(`Code sent to DeepSeek Chat: ${selection}`);
        }
    }));
    // Command to refresh the chat view
    context.subscriptions.push(vscode.commands.registerCommand('deepseek.refreshChat', () => {
        vscode.commands.executeCommand('workbench.view.extension.deepseekWeb');
        vscode.window.showInformationMessage('DeepSeek Chat refreshed.');
    }));
    // Add a status bar item to open the chat
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.text = "$(comment-discussion) DeepSeek";
    statusBarItem.tooltip = "Open DeepSeek Chat";
    statusBarItem.command = "deepseek.openChat";
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);
}
exports.activate = activate;
class DeepSeekChatViewProvider {
    constructor(context) {
        this.context = context;
    }
    resolveWebviewView(webviewView) {
        this.webviewView = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            enableForms: true,
        };
        const config = vscode.workspace.getConfiguration('deepseekWeb');
        const chatUrl = config.get('chatUrl', 'https://chat.deepseek.com/');
        webviewView.webview.html = `
      <html>
        <body style="margin: 0; padding: 0; height: 100vh;">
          <iframe
            id="deepseekIframe"
            src="${chatUrl}"
            style="width: 100%; height: calc(100% - 40px); border: none;"
          ></iframe>
          <div style="height: 40px; display: flex; align-items: center; justify-content: center; background: #f3f3f3;">
            <button id="applyCodeButton" style="padding: 5px 10px; font-size: 14px;">
              Apply Code to VS Code
            </button>
          </div>
          <script>
            const vscode = acquireVsCodeApi();
            const applyCodeButton = document.getElementById('applyCodeButton');

            // Listen for messages from the iframe (DeepSeek Chat)
            window.addEventListener('message', (event) => {
              if (event.data.type === 'generatedCode') {
                // Store the generated code
                applyCodeButton.code = event.data.code;
              }
            });

            // Send the generated code to the extension when the button is clicked
            applyCodeButton.addEventListener('click', () => {
              if (applyCodeButton.code) {
                vscode.postMessage({ type: 'applyCode', code: applyCodeButton.code });
              } else {
                alert('No code generated yet!');
              }
            });

            // Simulate code generation from DeepSeek Chat
            const iframe = document.getElementById('deepseekIframe');
            iframe.onload = () => {
              // Simulate sending generated code from DeepSeek Chat
              setTimeout(() => {
                iframe.contentWindow.postMessage(
                  { type: 'generatedCode', code: 'console.log("Hello, DeepSeek!");' },
                  '*'
                );
              }, 5000); // Simulate a 5-second delay for code generation
            };
          </script>
        </body>
      </html>
    `;
        // Listen for messages from the Webview
        webviewView.webview.onDidReceiveMessage((message) => {
            if (message.type === 'applyCode') {
                this.applyCodeToEditor(message.code);
            }
        });
    }
    // Method to apply code to the active editor
    applyCodeToEditor(code) {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const selection = editor.selection;
            editor.edit((editBuilder) => {
                if (selection.isEmpty) {
                    // If no text is selected, insert the code at the cursor position
                    editBuilder.insert(selection.start, code);
                }
                else {
                    // If text is selected, replace the selection with the code
                    editBuilder.replace(selection, code);
                }
            });
            vscode.window.showInformationMessage('Code applied successfully!');
        }
        else {
            vscode.window.showErrorMessage('No active editor found.');
        }
    }
    // Method to inject code into the Webview
    injectCode(code) {
        if (this.webviewView) {
            this.webviewView.webview.postMessage({ type: 'injectCode', code });
        }
    }
}
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map