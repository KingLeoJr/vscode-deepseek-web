"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
function activate(context) {
    const provider = new DeepSeekChatViewProvider(context);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider('deepseekChatView', provider));
    context.subscriptions.push(vscode.commands.registerCommand('deepseek.openChat', () => {
        vscode.commands.executeCommand('workbench.view.extension.deepseekWeb');
    }));
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
            style="width: 100%; height: 100%; border: none;"
          ></iframe>
        </body>
      </html>
    `;
    }
}
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map