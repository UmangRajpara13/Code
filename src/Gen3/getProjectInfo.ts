import * as fs from "fs";
import * as path from "path";

export function checkPackageJson(
  projectDir: string,
  connection: WebSocket | import("ws")
) {
  const packageJsonPath = path.join(projectDir, "package.json");
  fs.access(packageJsonPath, fs.constants.F_OK, (err) => {
    if (err) {
      console.log("No package.json found");
      return;
    }

    console.log("package.json found");

    fs.readFile(packageJsonPath, "utf-8", (err, data) => {
      if (err) {
        console.error("Error reading package.json", err);
        return;
      }

      const packageJson = JSON.parse(data);
      const scripts = packageJson.scripts;

      if (!scripts) {
        console.log("No scripts found in package.json");
        return;
      }

      console.log("Scripts:", scripts);

      let packageManager: string | undefined;

      if (fs.existsSync(path.join(projectDir, "yarn.lock"))) {
        packageManager = "yarn";
      } else if (fs.existsSync(path.join(projectDir, "pnpm-lock.yaml"))) {
        packageManager = "pnpm";
      } else {
        packageManager = "npm";
      }

      console.log("Package manager:", packageManager);

      //
      let scriptsObj: any = {};

      Object.keys(scripts).forEach(function (scriptKey) {
        scriptsObj = {
          ...scriptsObj,
          [`run-${scriptKey}-script`]: {
            client: "vscode",
            action: {
              api: "run-script",
              payload: {
                title: scriptKey,
                command: `${packageManager} run ${scriptKey}`,
              },
            },
          },
        };
      });
      // sending scriptsObj as actions
      const dataPacket = {
        awareness: {
          id: "vscode",
          type: "actions",
          scope: "onActiveWindow",
          payload: scriptsObj,
        },
      };
      connection.send(JSON.stringify(dataPacket));
    });
  });
}
