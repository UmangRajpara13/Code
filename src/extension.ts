import { exec, execSync, spawn } from "child_process";
import { join, relative, sep } from "path";
import vscode, { commands, Uri, extensions } from "vscode";
// import { init } from 'vscode-nls-i18n';
import { outputFile, outputFileSync } from "fs-extra";
// import commands from './commands';
// import { logger } from './logger';

import { WebSocket } from "ws";
import {
  initiateStagingProcess,
  stageAllChanges,
  stageCurrentFile,
} from "./git/staging";

let some = extensions.getExtension("vscode.git")?.exports;
// let importedApi = some.exports;
// console.log(extensions.all)
console.log(some);

var defaultPort = process.env.NODE_ENV === "production" ? 1111 : 2222;
var isFocused = true;
var projectRoot: string | undefined;

function connectToWebSocketServer() {
  const ws = new WebSocket(`ws://localhost:${defaultPort}`);
  // console.log(ws, textEditor.document.fileName)

  ws.on("error", function error(err) {
    // vscode.window.showInformationMessage(`[Error] Please check if Schnell is running and listening on ${port}`);
    console.log("ws error", err);
  });
  ws.on("open", function open() {
    console.log("ws open");
    ws.send(`id:code.Code`);
  });

  ws.on("message", function message(data) {
    console.log("received: %s", data, isFocused);
    // vscode.window.showInformationMessage(`${data} ${isFocused}`);

    // eslint-disable-next-line curly
    if (!isFocused) return;

    switch (`${data}`) {
      case `say-hello`:
        // open vscode new-Window with small size
        // make terminal fullscreen and add in editor like tabs
        // remove menubar, activity bar

        vscode.window.showInformationMessage(`Hello Boss`);

        break;
      case `audit-changes`:
        initiateStagingProcess();

        break;
      case "git-stage-current-file":
        stageCurrentFile();
        break;
      case "stage-all-changes":
        stageAllChanges();
        break;
      case "git-commit":
        vscode.window.showInformationMessage("commit");

        // open input box
        vscode.window
          .showInputBox({ placeHolder: "Enter a Commit Message" })
          .then((value) => {
            console.log(value);
            // eslint-disable-next-line curly
            if (value === undefined) return;

            var projectRoot = vscode.workspace.workspaceFolders?.[0].uri.fsPath;

            execSync(`cd '${projectRoot}' && git commit -m "${value}"`);
          });

        break;

      case "git-push":
        projectRoot = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
        try {
          execSync(`cd '${projectRoot}' && git push`);
          vscode.window.showInformationMessage("Push Successfull");
        } catch (error) {
          vscode.window.showInformationMessage(`${error}`);
        }
        break;
      case "commit-changes-and-push":
        vscode.window
          .showInputBox({ placeHolder: "Enter a Commit Message" })
          .then((value) => {
            console.log(value);
            // eslint-disable-next-line curly
            if (value === undefined) return;

            var projectRoot = vscode.workspace.workspaceFolders?.[0].uri.fsPath;

            execSync(`cd '${projectRoot}' && git commit -m "${value}"`);
            vscode.window
              .withProgress(
                {
                  location: vscode.ProgressLocation.Notification,
                  title: `Push to Remote`,
                  cancellable: false,
                },
                async (progress, token) => {
                  progress.report({ message: "Uploading..." });

                  // Long running task here...
                  await new Promise<void>(async (resolve, reject) => {
                    // Simulate an error by rejecting the Promise
                    //   setTimeout(() => reject("Error occurred!"), 5000);
                    try {
                      execSync(`cd '${projectRoot}' && git push`);
                      resolve();
                    } catch (error) {
                      vscode.window.showWarningMessage(`${error}`);
                      reject();
                    }
                    progress.report({ message: "Upload Successfull!" });
                  });
                  return;
                }
              )
              .then(async (result) => {
                console.log(result);
              });
          });
        break;
      case "create-a-bash-script":
        projectRoot = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
        var scriptPath = `${projectRoot}/Playground`;
        var tempFileName = new Date().toISOString();
        try {
          outputFileSync(`${scriptPath}/${tempFileName}.sh`, "#!/bin/bash\n");
          vscode.window
            .showTextDocument(Uri.file(`${scriptPath}/${tempFileName}.sh`))
            .then(
              (textEditor) => {
                vscode.window
                  .showInputBox({
                    title: "Rename your bash script",
                    value: tempFileName,
                  })
                  .then((value) => {
                    console.log(value);
                    // eslint-disable-next-line curly
                    if (value === undefined) return;
                    execSync(
                      `mv '${scriptPath}/${tempFileName}.sh' '${scriptPath}/${value}.sh'`
                    );
                    vscode.commands.executeCommand(
                      "workbench.action.closeActiveEditor"
                    );
                    vscode.window.showTextDocument(
                      Uri.file(`${scriptPath}/${value}.sh`)
                    );
                    vscode.window.showInformationMessage(
                      "create bash -> Successfull"
                    );
                  });
              },
              (rejectionReason) => {}
            );
        } catch (error) {
          vscode.window.showInformationMessage(`${error}`);
        }
        break;
      case "show-scripts":
        projectRoot = vscode.workspace.workspaceFolders?.[0].uri.fsPath;

        try {
          vscode.window.showTextDocument(
            Uri.file(`${projectRoot}/package.json`)
          );
          vscode.window.showInformationMessage("show-scripts Successfull");
        } catch (error) {
          vscode.window.showInformationMessage(`${error}`);
        }
        break;
      case "install-package":
        projectRoot = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
        try {
          vscode.window
            .showInputBox({
              title: "install a package",
              prompt: `Use '<package-name> -D' to save as dev dependency`,
            })
            .then((value) => {
              console.log(value);
              // eslint-disable-next-line curly
              if (value === undefined) return;

              const installTerminal = vscode.window.createTerminal();
              installTerminal.show();
              installTerminal.sendText(`npm install ${value}`);
            });
          vscode.window.showInformationMessage("Push Successfull");
        } catch (error) {
          vscode.window.showInformationMessage(`${error}`);
        }
        break;
      case "open-folder":
        vscode.commands.executeCommand("vscode.openFolder");
        break;
      case "create-a-new-file":
        projectRoot = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
        var tempFileName = new Date().toISOString();
        try {
          vscode.window
            .showInputBox({
              title: "Enter the name of your new file",
              value: tempFileName,
            })
            .then((value) => {
              console.log(value);
              // eslint-disable-next-line curly
              if (value === undefined) return;
              // outputFileSync(`${projectRoot}/${value}.sh`);

              execSync(`touch '${projectRoot}/${value}'`);
              vscode.window
                .showTextDocument(Uri.file(`${projectRoot}/${value}`))
                .then(
                  (textEditor) => {},
                  (rejectionReason) => {}
                );
            });
        } catch (error) {
          vscode.window.showInformationMessage(`${error}`);
        }
        break;
      default:
        break;
    }
  });

  ws.on("close", function message(data) {
    // vscode.window.showInformationMessage('Schnell : Disconnected!');
    console.log("ws close");
    setTimeout(() => {
      connectToWebSocketServer();
    }, 1000);
  });
}

export function activate(context: vscode.ExtensionContext): void {
  console.log("ext Activated!", process.env);

  vscode.window.showInformationMessage(`At your service Boss! - ABLE`);

  vscode.window.onDidChangeWindowState((winState) => {
    console.log(winState);
    isFocused = winState.focused;
  });

  connectToWebSocketServer();

  // init(context.extensionPath);
  // console.log(process.env.NODE_ENV)
  // logger.log(`language: ${vscode.env.language}`);
  // const { remoteName } = vscode.env;
  // if (remoteName) {
  //     logger.log(`active extension in ${remoteName} remote environment`);
  // }

  // commands.forEach((command) => {
  //     context.subscriptions.push(vscode.commands.registerCommand(command.identifier!, command.handler));
  // });
}

export function deactivate(): void {
  // logger.dispose();
}
