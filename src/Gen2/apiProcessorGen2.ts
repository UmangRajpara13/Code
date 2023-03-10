import { exec, execSync, spawn } from "child_process";
import { join, relative, sep } from "path";
import vscode, { commands, Uri, extensions } from "vscode";
// import { init } from 'vscode-nls-i18n';
import { outputFile, outputFileSync } from "fs-extra";
import {
  initiateStagingProcess,
  stageAllChanges,
  stageCurrentFile,
} from "./git/staging";

var projectRoot: string | undefined;

export function apiProcessorGen2(api:Object,isFocused: boolean) {
  // eslint-disable-next-line curly
  if (!isFocused) return;

  switch (`${api}`) {
    case `say-hello`:
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
                  try {
                    execSync(`cd '${projectRoot}' && git push`);
                    resolve();
                  } catch (error) {
                    vscode.window.showWarningMessage(`${error}`);
                    reject();
                  }
                }).then(() => {
                  vscode.commands.executeCommand(
                    "workbench.action.toggleFullScreen"
                  );
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
        vscode.window.showTextDocument(Uri.file(`${projectRoot}/package.json`));
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
}
