import { exec, execSync, spawn } from "child_process";
import { join, relative, sep } from "path";
import vscode, { commands, Uri, extensions } from "vscode";
// import { init } from 'vscode-nls-i18n';
import { outputFile, outputFileSync } from "fs-extra";
// import commands from './commands';
// import { logger } from './logger';

import { WebSocket } from "ws";

import { apiProcessorGen2 } from "./Gen2/apiProcessorGen2";
import { apiProcessorGen3 } from "./Gen3/apiProcessorGen3";

var connection: WebSocket | null;
var defaultPort = 1111;
var isFocused = true;

function connectToWebSocketServer() {
  connection = new WebSocket(`ws://localhost:${defaultPort}`);

  connection.on("error", function error(err) {
    console.log("connection error", err);
  });
  connection.on("close", function message(data) {
    console.log("connection close");
    setTimeout(() => {
      connectToWebSocketServer();
    }, 1000);
  });
  connection.on("open", function open() {
    console.log("connection open");
    connection?.send(`id:code.Code`);
  });

  connection.on("message", function message(data) {
    console.log("received: %s", data, isFocused);

    // apiProcessorGen2(data, isFocused);
    apiProcessorGen3(data, isFocused);
  });
}

export function activate(context: vscode.ExtensionContext): void {
  console.log("ext Activated!", process.env);

  vscode.window.showInformationMessage(`Able : At your service Boss!`);

  vscode.window.onDidChangeWindowState((winState) => {
    console.log(winState);
    isFocused = winState.focused;
  });

  connectToWebSocketServer();
}

export function deactivate(): void {
  // logger.dispose();
}
