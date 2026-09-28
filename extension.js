const vscode = require('vscode');
const http = require('http');
const fs = require('fs');
const path = require('path');

let server = null;
let serverUrl = null;
let statusItem = null;

function createServer(context) {
  const htmlPath = path.join(context.extensionPath, 'media', 'index.html');
  return http.createServer((req, res) => {
    if (req.url === '/' || req.url.startsWith('/?')) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(fs.readFileSync(htmlPath));
    } else {
      res.writeHead(404);
      res.end('Not found');
    }
  });
}

function listen(srv, port) {
  return new Promise((resolve, reject) => {
    srv.once('error', reject);
    srv.listen(port, '127.0.0.1', () => resolve(srv.address().port));
  });
}

async function start(context) {
  if (!server) {
    server = createServer(context);
    let port;
    try {
      port = await listen(server, 5757); // fixed port so camera permission is remembered
    } catch {
      server.removeAllListeners('error');
      port = await listen(server, 0);
    }
    serverUrl = `http://localhost:${port}/`;
    statusItem.text = '$(unmute) Gesture Synth: ON';
  }
  // Camera access does not work inside VS Code webviews, so we open the
  // page in your normal browser (localhost counts as a secure context).
  const uri = await vscode.env.asExternalUri(vscode.Uri.parse(serverUrl));
  vscode.env.openExternal(uri);
}

function stop() {
  if (server) {
    server.close();
    server = null;
    serverUrl = null;
  }
  statusItem.text = '$(mute) Gesture Synth';
}

function activate(context) {
  statusItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusItem.text = '$(mute) Gesture Synth';
  statusItem.command = 'gestureSynth.start';
  statusItem.tooltip = 'Click to launch Gesture Synth';
  statusItem.show();

  context.subscriptions.push(
    statusItem,
    vscode.commands.registerCommand('gestureSynth.start', () => start(context)),
    vscode.commands.registerCommand('gestureSynth.stop', stop)
  );
}

function deactivate() { stop(); }

module.exports = { activate, deactivate };
