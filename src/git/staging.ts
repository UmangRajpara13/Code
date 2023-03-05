import vscode, { commands, Uri, extensions } from "vscode";
import { join, relative, sep } from "path";
import { exec, execSync, spawn } from "child_process";
import { existsSync } from "fs";

let changes: any, projectRoot: string | undefined;

async function openNextFIleToStage(i: number) {
  if (changes.length >= 1) {
    try {
      const tmp = changes[i].a.command.arguments;
      console.log(tmp);
      if (existsSync(tmp[0].path)) {
        await vscode.commands.executeCommand(
          "vscode.diff",
          tmp[0],
          tmp[1],
          tmp[2]
        );
      } else {
        vscode.window.showInformationMessage("Moving to next file!");
        changes.splice(0, 1);
        openNextFIleToStage(i++);
      }
    } catch (error) {
      vscode.window.showErrorMessage(`${error}`);
    }
  } else {
    vscode.window.showInformationMessage("Nothing to stage!");
  }
}

export async function stageCurrentFile() {
  projectRoot = vscode.workspace.workspaceFolders?.[0].uri.fsPath;

  var fileName = vscode.window.activeTextEditor?.document.fileName;

  vscode.window
    .withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: `Stagging : ${fileName?.substring(
          fileName.lastIndexOf(sep) + 1
        )}`,
        cancellable: false,
      },
      async (progress, token) => {
        //   progress.report({ message: "Task started..." });

        // Long running task here...
        await new Promise<void>(async (resolve, reject) => {
          // Simulate an error by rejecting the Promise
          //   setTimeout(() => reject("Error occurred!"), 5000);
          try {
            execSync(`cd '${projectRoot}' && git add '${fileName}'`);
            await vscode.commands.executeCommand(
              "workbench.action.closeActiveEditor"
            );
            resolve();
          } catch (error) {
            vscode.window.showWarningMessage(`${error}`);
            changes.splice(0, 1);
            openNextFIleToStage(0);
            reject();
          }
        });
        return;
      }
    )
    .then(async (result) => {
      console.log(result);
      //   remove current file from unstaged changes
      changes.splice(0, 1);
      openNextFIleToStage(0);
    });
}

export function stageAllChanges(){
  projectRoot = vscode.workspace.workspaceFolders?.[0].uri.fsPath;

  vscode.window
  .withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: `Stagging`,
      cancellable: false,
    },
    async (progress, token) => {
        progress.report({ message: "Staging All..." });

      // Long running task here...
      await new Promise<void>(async (resolve, reject) => {
        // Simulate an error by rejecting the Promise
        //   setTimeout(() => reject("Error occurred!"), 5000);
        try {
          execSync(`cd '${projectRoot}' && git add .`);
          resolve();
        } catch (error) {
          vscode.window.showWarningMessage(`${error}`);
          reject();
        }
      });
      progress.report({ message: "Ready to Commit!" });

      return;
    }
  );
}

export async function initiateStagingProcess() {
  projectRoot = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
  const gitExt = vscode.extensions.getExtension("vscode.git")!;
  const api = gitExt.exports.getAPI(1);

  const repo = api.repositories[0];
  changes = await repo.state.workingTreeChanges;
  console.log(changes);
  // Iterate over each changed file and open Git changes
  openNextFIleToStage(0);
}
