import chokidar from "chokidar";
import boxen from "boxen";
import BootstrapTypedoc from "../utils/typedoc-bootstrap.js";
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

type serveOptions = {
  port: number;
  force?: boolean;
};

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
    .action(async (options: serveOptions) => {
      const app = await BootstrapTypedoc();

      let cachedir: string;
      let current_project: ProjectReflection | undefined;
      let _ran_initial = false;

      app.convertAndWatch((project) => {
        return new Promise(async (resolve) => {
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

            // watching for change in docs entry folder
            chokidar
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
            chokidar
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
                BuildAndTranspileProject(cachedir, project);
                ConfigurationFileChangedSpinner.text(
                  "Configuration file change detected, Compiled."
                );
                ConfigurationFileChangedSpinner.stop(true);
              });

            const cmd = `${GetPreferredBinExecuteablePM()} vitepress dev --strictPort ${
              options.port ? ` --port=${options.port}` : ""
            } ${options.force ? ` --force=${options.force}` : ""}`;

            // build and transpile initially
            BuildAndTranspileProject(cachedir, project);

            exec(cmd, { cwd: cachedir }, (err) => {
              if (err) {
                Console.error(err);
              }
            });
          }
          // runs on program project watch (including the initial run)
          LogServerStarted({
            packageName: project.packageName,
            packageVersion: project.packageVersion,
            port: options.port.toString(),
            TypescriptVersion: app.getTypeScriptVersion(),
            VitePressVersion: GetVitePressVersionOfCachedProject(cachedir),
          });

          // runs everytime after the initial run
          if (_ran_initial === true) {
            BuildAndTranspileProject(cachedir, project, {
              NoCompilationOfViteUserConfig: true,
              NoInitializationOfTsDocConfig: true,
            });
          }

          _ran_initial = true;
          resolve();
        });
      });
    });
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
`,
      { padding: 0.4 }
    )
  );
}
