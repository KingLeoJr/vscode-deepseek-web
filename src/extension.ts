import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  // Command to open DeepSeek Chat
  context.subscriptions.push(
    vscode.commands.registerCommand('deepseek.openChat', () => {
      const panel = vscode.window.createWebviewPanel(
        'deepseekChat', // ID
        'DeepSeek Chat', // Title
        vscode.ViewColumn.One, // Show in the first editor column
        {
          enableScripts: true, // Enable JavaScript in the Webview
          retainContextWhenHidden: true, // Retain state when the panel is hidden
        }
      );

      // Load the DeepSeek Chat website
      panel.webview.html = `
        <html>
          <body style="margin: 0; padding: 0; height: 100vh;">
            <iframe
              src="https://chat.deepseek.com/"
              style="width: 100%; height: 100%; border: none;"
            ></iframe>
          </body>
        </html>
      `;
    })
  );

  // Command to send selected code to DeepSeek Chat
  context.subscriptions.push(
    vscode.commands.registerCommand('deepseek.sendCode', () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        const selection = editor.document.getText(editor.selection);
        const panel = vscode.window.createWebviewPanel(
          'deepseekChat',
          'DeepSeek Chat',
          vscode.ViewColumn.One,
          {
            enableScripts: true,
            retainContextWhenHidden: true,
          }
        );

        // Load DeepSeek Chat with the selected code pre-filled
        panel.webview.html = `
          <html>
            <body style="margin: 0; padding: 0; height: 100vh;">
              <iframe
                src="https://chat.deepseek.com/"
                style="width: 100%; height: 100%; border: none;"
              ></iframe>
              <script>
                window.addEventListener('message', (event) => {
                  const iframe = document.querySelector('iframe');
                  if (iframe && event.data === '${selection}') {
                    iframe.contentWindow.postMessage('${selection}', '*');
                  }
                });
              </script>
            </body>
          </html>
        `;
      }
    })
  );
}

export function deactivate() {}