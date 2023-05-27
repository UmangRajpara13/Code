import { apiProcessorGen3 } from "./apiProcessorGen3";
import vscode, { Uri } from "vscode";
import { WebSocket } from "ws";
import { checkPackageJson } from "./getProjectInfo";
import { exec, execSync } from "child_process";

var defaultPort = 1111;
var windowID: string | undefined;
var connection: WebSocket | import("ws");

// as the app launches we assume that it's window is curently in focus
// even without user specificaly selecting the window with mouse,
// this assumption doesn't work with 'hover to select the window' as mouse can be
// over another window when this window is launched. hence the focus woud be on other window
// and out initial assumtion would be wrong.

var isFocused = true;

vscode.window.onDidChangeWindowState((windowState) => {
  console.log(windowState);
  isFocused = windowState.focused;
  if (isFocused) {
    // we let 'Able' know that one of the VS Codes' window is focused
    // so that it will redirect all voice commands through websockets
    // to this extension.
    connection?.send(JSON.stringify({ focusedClientId: `vscode` }));
  } else {
    connection?.send(JSON.stringify({ focusedClientId: null }));
  }
});

function init(
  context: vscode.ExtensionContext,
  connection: WebSocket | import("ws")
) {
  const projectDir = vscode.workspace.workspaceFolders?.[0].uri.fsPath;

  if (!projectDir) {
    vscode.window.showErrorMessage("No workspace opened.");
    return;
  }
  const relativePattern = new vscode.RelativePattern(projectDir, "**/*");
  const watcher = vscode.workspace.createFileSystemWatcher(
    relativePattern,
    false,
    false,
    false
  );
  watcher.onDidChange((uri) => {
    console.log(`File ${uri.fsPath} changed`);
  });
  watcher.onDidCreate((uri) => {
    console.log(`File ${uri.fsPath} created`);
  });
  watcher.onDidDelete((uri) => {
    console.log(`File ${uri.fsPath} deleted`);
  });
  checkPackageJson(projectDir, connection);

  context.subscriptions.push(watcher);
}

export function connectToWebSocketServer(context: vscode.ExtensionContext) {
  connection = new WebSocket(`wss://localhost:${defaultPort}`, {
    rejectUnauthorized: false,
  });

  connection.on("error", function error(err) {
    console.log("connection error", err);
    // setTimeout(() => {
    //   connectToWebSocketServer(context);
    // }, 1000);
  });

  connection.on("close", function message(data) {
    console.log("connection close");
    setTimeout(() => {
      connectToWebSocketServer(context);
    }, 1000);
  });

  connection.on("open", function open() {
    console.log("connection open");
    connection?.send(JSON.stringify({ id: `vscode` }));

    vscode.window.showInformationMessage(`Able: At your service Boss!`);

    init(context, connection);
  });

  connection.on("message", function message(data) {
    console.log("received: %s", data, isFocused);

    // apiProcessorGen2(data, isFocused);
    apiProcessorGen3(data, isFocused, windowID);
  });
}
