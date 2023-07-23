import { exec, execSync } from "child_process";
import vscode, { Uri } from "vscode";
import { outputFileSync } from "fs-extra";
import {
  initiateStagingProcess,
  stageAllChanges,
  stageCurrentFile,
} from "./git/staging";

var projectRoot: string | undefined;

export function apiProcessorGen3(
  data: Object,
  isFocused: boolean,
  windowID: string | undefined
) {
  if (!isFocused) {
    return;
  }

  console.log("Gen3 Intent Processor", JSON.parse(`${data}`));

  const dataPacket = JSON.parse(`${data}`);
  const spokenSentence = dataPacket.spokenSentence;
  const raw = spokenSentence
    .trim()
    .toLowerCase()
    .replace(/[.,\/#!?$%\^&\*;:{}=\-_`~()]/g, "")
    .replace(/\s{2,}/g, " ");

  const intent = raw.replaceAll(" ", "-");

  switch (intent) {
    case `say-hello`:
      vscode.window.showInformationMessage(`Hello Boss!`);
      break;
    case `initiate-staging-process`:
      initiateStagingProcess();
      break;
    case "okay":
      stageCurrentFile();
      break;
    case "stage-all-changes":
      stageAllChanges();
      break;
    case "create-a-checkpoint":
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
    case "push-to-remote":
      projectRoot = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
      try {
        vscode.window
          .withProgress(
            {
              location: vscode.ProgressLocation.Notification,
              title: `Pushing to Remote`,
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
                progress.report({ message: "Push Successfull!" });
              });
              return;
            }
          )
          .then(async (result) => {
            console.log(result);
          });
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
                title: `Pushing to Remote`,
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
    case "open-package-file":
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
    case "run-script":
      var title = dataPacket.payload.title;
      var run = dataPacket.payload.command;
      const terminal = vscode.window.createTerminal(`( ${title} )`);
      terminal.show();
      terminal.sendText(run);

      break;
    case `close-window`:
      // eslint-disable-next-line curly

      try {
        exec(`wmctrl -i -c $(xdotool getactivewindow)`);
      } catch (error) {
        vscode.window.showWarningMessage(`${error}`);
      }

      break;
    default:
      console.log("Unhandled", dataPacket);
      break;
  }
}
