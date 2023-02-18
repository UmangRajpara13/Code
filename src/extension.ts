import { exec, execSync, spawn } from "child_process";
import { join, relative, sep } from "path";
import vscode, { commands, Uri, extensions } from "vscode";
// import { init } from 'vscode-nls-i18n';
import { outputFile, outputFileSync } from "fs-extra";
// import commands from './commands';
// import { logger } from './logger';

import { WebSocket } from "ws";

let some = extensions.getExtension("vscode.git")?.exports;
// let importedApi = some.exports;
// console.log(extensions.all)
console.log(some);

var defaultPort = process.env.NODE_ENV === "production" ? 1111 : 2222;

function sayHello() {
  vscode.window.showInformationMessage(`Hello Boss`);
}

export function activate(context: vscode.ExtensionContext): void {
  console.log("ext Activated!", process.env);

  var isFocused = true;

  vscode.window.showInformationMessage(
    `At your service Boss! - ABLE`
  );
  commands.executeCommand("vscode.git");

  vscode.window.onDidChangeWindowState((winState) => {
    console.log(winState);
    isFocused = winState.focused;
  });

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

    if (!isFocused) return;

    switch (`${data}`) {
      case `say-hello`:
        // open vscode new-Window with small size
        // make terminal fullscreen and add in editor like tabs
        // remove menubar, activity bar

        sayHello();
        break;
      case `new-window`:
        exec(`code --new-window`, () => {});
        break;

      case `audit-changes`:
        break;
      case "git-stage-current-file":
        var fileName = vscode.window.activeTextEditor?.document.fileName;

        vscode.window.showInformationMessage(
          `Stagging -> ${fileName?.substring(fileName.lastIndexOf(sep) + 1)}`
        );

        var projectRoot;

        vscode.workspace.workspaceFolders?.forEach((folder) => {
          if (fileName?.includes(folder.uri.fsPath)) {
            projectRoot = folder.uri.fsPath;
          }
        });

        console.log(
          process.cwd(),
          projectRoot,
          vscode.workspace.workspaceFolders,
          vscode.window.activeTextEditor
        );

        try {
          execSync(`cd '${projectRoot}' && git add '${fileName}'`);
          // var execute = spawn("git", ["add", `${fileName}`], {
          //   cwd: projectRoot,
          // });
          // execute.stdout.on("data", (data) => {
          //   // process.stdout.write(`<< ${data} `.replace("\n", ""));
          // });

          // execute.stderr.on("data", (data) => {
          //   // console.error(`stderr: ${data}`);
          // });

          // execute.on("close", (code) => {
          //   // eslint-disable-next-line eqeqeq
          //   if (code == 0) {
          //     vscode.commands.executeCommand(
          //       "workbench.action.closeActiveEditor"
          //     );
          //     return;
          //   }
          //   process.stdout.write(`Exit Code ${code}`);
          // });
          vscode.commands.executeCommand("workbench.action.closeActiveEditor");
        } catch (error) {
          vscode.window.showWarningMessage(`${error}`);
        }
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
      default:
        break;
    }
  });

  ws.on("close", function message(data) {
    // vscode.window.showInformationMessage('Schnell : Disconnected!');
    console.log("ws close");
  });

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
