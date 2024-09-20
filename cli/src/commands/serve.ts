/**
 * Typed with ❤️ @ mekstuff
 */

const REFERENCE_LINK_TO_HOW_TO_KILL_WIN32_PROCESSES =
  "https://stackoverflow.com/questions/39632667/how-do-i-remove-the-process-currently-using-a-port-on-localhost-in-windows";
// TODO: vitepress processes aren't closed whenever an error occurs with config compiling.
// TODO: chokidar watches should have some form of debounce or better detection, as deleting an entire folder may register each child as being removed, trigger compilation alot of times when it could've been just 1.

import readline from "readline";
import chokidar from "chokidar";
import boxen from "boxen";
import treekill from "tree-kill";
import BootstrapTypedoc, {
  SetTypeDocProject,
} from "../utils/typedoc-bootstrap.js";
import { program as CommanderProgrammer } from "commander";
import {
  CreateNewDocDocsCacheProject,
  GetDocDocsConfig,
  GetDocDocsConfigDir,
  GetVitePressVersionOfCachedProject,
  LoadDocDocsConfig,
} from "../utils/core.js";
import { Console } from "@mekstuff/logreport";
import { exec } from "child_process";
import { ProjectReflection } from "typedoc";
import {
  CopyCustomComponentsIntoThemeAtDirectory,
  LoadDocsFromEntryToDirectory,
  WriteDefaultIndexForVitePressThemeAtDirectory,
} from "../utils/vitepress-template-builder.js";
import { GetPreferredBinExecuteablePM } from "../utils/get-preferred-package-manager.js";
import { BuildAndTranspileProject } from "./build.js";
import { _use_pm_option } from "../CONSTANTS.js";

type serveOptions = {
  port: number;
  force?: boolean;
};

/**
  Commands
 */
export default function ServeCommand(program: typeof CommanderProgrammer) {
  program
    .command("serve")
    .alias("dev")
    .option(
      "--port <port>",
      "Specify port number, learn more: https://vitepress.dev/reference/cli",
      "3000"
    )
    .option("--force", "learn more: https://vitepress.dev/reference/cli")
    .option(_use_pm_option[0], _use_pm_option[1], _use_pm_option[2])
    .action(async (options: serveOptions) => {
      const app = await BootstrapTypedoc();

      let cachedir: string;
      let current_project: ProjectReflection | undefined;
      let _ran_initial = false;

      app.convertAndWatch((project) => {
        SetTypeDocProject(project);
        return new Promise(async (resolve) => {
          // load the DocDocs config file on every change.
          await LoadDocDocsConfig();

          if (cachedir === undefined) {
            // initial run
            const ddconfig = GetDocDocsConfig();
            if (!project.packageName) {
              Console.error("packageName missing from project.");
              process.exit(1);
            }
            current_project = project;
            cachedir = CreateNewDocDocsCacheProject(project.packageName);
            // TODO: optimize chokidar to not run multiple times if a directory is removed etc.
            // watching for change in docs entry folder
            const chdrDocsWatcher = chokidar
              .watch(ddconfig.DocsEntry, { ignoreInitial: true })
              .on("all", (_, p) => {
                LoadDocsFromEntryToDirectory(cachedir);
                if (p.indexOf(".components") !== -1) {
                  // change made to a component, update custom-components
                  CopyCustomComponentsIntoThemeAtDirectory(cachedir);
                  WriteDefaultIndexForVitePressThemeAtDirectory(cachedir);
                }
              });

            // watching for change within `docdocs.config.js`
            const chdrConfigWatcher = chokidar
              .watch(GetDocDocsConfigDir(), { ignoreInitial: true })
              .on("change", async () => {
                const ConfigurationFileChangedSpinner =
                  Console.progress.spinner(
                    "dots2",
                    "Configuration file change detected, Compiling..."
                  );
                ConfigurationFileChangedSpinner.start();
                if (!current_project || !cachedir) {
                  ConfigurationFileChangedSpinner.text(
                    "Could not compile after configuration file changed because the project was not yet initialized."
                  );
                  ConfigurationFileChangedSpinner.stop();
                  return;
                }
                await LoadDocDocsConfig();
                BuildAndTranspileProject(cachedir, project, {
                  TsDocConfigurationChanged: true,
                  ViteUserConfigChanged: true,
                });
                ConfigurationFileChangedSpinner.text(
                  "Configuration file change detected, Compiled."
                );
                ConfigurationFileChangedSpinner.stop(true);
              });

            const cmd = `${
              GetPreferredBinExecuteablePM(cachedir).bin
            } vitepress dev --strictPort ${
              options.port ? ` --port=${options.port}` : ""
            } ${options.force ? ` --force=${options.force}` : ""}`;

            // build and transpile initially
            BuildAndTranspileProject(cachedir, project, {
              ViteUserConfigChanged: true,
              TsDocConfigurationChanged: true,
            });

            const _vpexec = exec(cmd, { cwd: cachedir }, (err) => {
              if (err) {
                Console.error(err);
                Console.log(
                  `If the error above states that a port is already being used, Maybe a previous Instance of vitepress failed to close successfully.\n\nRefer to: ${REFERENCE_LINK_TO_HOW_TO_KILL_WIN32_PROCESSES}`
                );
              }
            });
            process.on("exit", () => {
              chdrConfigWatcher.close();
              chdrDocsWatcher.close();
              Console.log(
                `On windows run: \nnetstat -ano | findstr :${options.port}\nand kill any running instances. Sometimes vitepress processes will not close, This may be a bug on our end. We're still looking into it.\n\nRefer to: ${REFERENCE_LINK_TO_HOW_TO_KILL_WIN32_PROCESSES}`
              );
              if (_vpexec.pid) {
                treekill(_vpexec.pid);
              }
            });
            // serve keybind controls
            readline.emitKeypressEvents(process.stdin);
            process.stdin.on("keypress", async (_, key) => {
              if (key && key.ctrl && key.name == "c") {
                Console.info("DocDocs closing...");
                process.exit();
              }
              if (key && key.ctrl && key.name === "r") {
                Console.info("Reloading...");
                await LoadDocDocsConfig();
                BuildAndTranspileProject(cachedir, project, {
                  TsDocConfigurationChanged: true,
                  ViteUserConfigChanged: true,
                });
              }
            });
            process.stdin.setRawMode(true);
          }
          // runs on program project watch (including the initial run)
          LogServerStarted({
            packageName: project.packageName,
            packageVersion: project.packageVersion ?? "0.0.0",
            port: options.port.toString(),
            TypescriptVersion: app.getTypeScriptVersion(),
            VitePressVersion: GetVitePressVersionOfCachedProject(cachedir),
          });

          // runs everytime after the initial run
          if (_ran_initial === true) {
            BuildAndTranspileProject(cachedir, project, {
              ViteUserConfigChanged: false,
              TsDocConfigurationChanged: false,
              // NoCompilationOfViteUserConfig: false,
              // NoInitializationOfTsDocConfig: false,
            });
          }

          _ran_initial = true;
          resolve();
        });
      });
    })
    .description(
      "Runs your documentation in development mode, detecting and rebuilding whenever you make changes."
    );
}

type LogServerStartedData = Partial<{
  packageName: string;
  packageVersion: string;
  port: string;
  VitePressVersion: string;
  TypescriptVersion: string;
}>;

function LogServerStarted(data: LogServerStartedData) {
  Console.LOG(
    boxen(
      `
${data.packageName}@${data.packageVersion}

DocDocs development server started.
http://localhost:${data.port}

Typescript version: ${data.TypescriptVersion}
Vitepress version: ${data.VitePressVersion}

Press \`CTRL + R\` to reload
`,
      { padding: 0.4 }
    )
  );
}
