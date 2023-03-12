import vscode from "vscode";

import { connectToWebSocketServer } from "./Gen3/init";

var isFocused = true;

export function activate(context: vscode.ExtensionContext): void {
  console.log("ext Activated!");

  vscode.window.onDidChangeWindowState((winState) => {
    console.log(winState);
    isFocused = winState.focused;
  });

  vscode.workspace.onDidChangeWorkspaceFolders((event) => {
    console.log(event.added);
    //   // for (const folder of event.added) {
    //   //   // Check if package.json exists in the added folder
    //   //   const packageJsonPath = vscode.Uri.joinPath(folder.uri, "package.json");
    //   //   // Watch package.json for changes and re-execute scripts when it changes
    //   //   const packageJsonWatcher = vscode.workspace.createFileSystemWatcher(
    //   //     packageJsonPath.fsPath
    //   //   ); // Read package.json and get the scripts object
    //   //   const packageJson = require(packageJsonPath.fsPath);
    //   //   const scripts = packageJson.scripts;
    //   //   packageJsonWatcher.onDidChange(() => {
    //   //     // Read package.json and get the scripts object
    //   //     const packageJson = require(packageJsonPath.fsPath);
    //   //     const scripts = packageJson.scripts;
    //   //     let packageManager: string | undefined;
    //   //     if (
    //   //       fs.existsSync(vscode.Uri.joinPath(folder.uri, "yarn.lock").fsPath)
    //   //     ) {
    //   //       packageManager = "yarn";
    //   //     } else if (
    //   //       fs.existsSync(
    //   //         vscode.Uri.joinPath(folder.uri, "pnpm-lock.yaml").fsPath
    //   //       )
    //   //     ) {
    //   //       packageManager = "pnpm";
    //   //     } else if (
    //   //       fs.existsSync(
    //   //         vscode.Uri.joinPath(folder.uri, "package-lock.json").fsPath
    //   //       )
    //   //     ) {
    //   //       packageManager = "npm";
    //   //     }

    //   //     // Loop through scripts and execute them using the appropriate package manager command
    //   //     if (packageManager) {
    //   //       const terminal = vscode.window.createTerminal(
    //   //         `Scripts (${packageManager})`
    //   //       );
    //   //       for (const [scriptName, scriptCommand] of Object.entries(scripts)) {
    //   //         switch (packageManager) {
    //   //           case "yarn":
    //   //             terminal.sendText(`yarn ${scriptName}`);
    //   //             break;
    //   //           case "pnpm":
    //   //             terminal.sendText(`pnpm run ${scriptName}`);
    //   //             break;
    //   //           case "npm":
    //   //             terminal.sendText(`npm run ${scriptName}`);
    //   //             break;
    //   //         }
    //   //       }
    //   //     }
    //   //   });

    //   //   // Store the packageJsonWatcher in the context so it can be disposed of when the extension is deactivated
    //   //   context.subscriptions.push(packageJsonWatcher);
    //   // }
  });

  connectToWebSocketServer(context, isFocused);
}

export function deactivate(): void {
  // logger.dispose();
}
