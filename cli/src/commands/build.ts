import fs from "fs";
import path from "path";
import crypto from "crypto";
import { program as CommanderProgrammer } from "commander";
import {
  CreateNewDocDocsCacheProject,
  GetDocDocsConfig,
  GetDocDocsRootCacheDirectory,
  GetDocsDocsCacheProject,
  LoadDocDocsConfig,
} from "../utils/core.js";
import { Console } from "@mekstuff/logreport";
import BuildVitePressTemplate, {
  CopyCustomComponentsIntoThemeAtDirectory,
  CopyDDTemplateComponentsIntoThemeAtDirectory,
  CreateIndexHomePageAtDir,
  CreateTeamMembersPageAtDirectory,
  LoadDocsFromEntryToDirectory,
  WriteDefaultIndexForVitePressThemeAtDirectory,
} from "../utils/vitepress-template-builder.js";
import { CompileViteUserConfig } from "../utils/vite-config.js";
import { transpileProject } from "../utils/transpiler.js";
import BootstrapTypedoc, {
  SetTypeDocProject,
} from "../utils/typedoc-bootstrap.js";
import { execSync } from "child_process";
import { GetPreferredBinExecuteablePM } from "../utils/get-preferred-package-manager.js";
import { ProjectReflection } from "typedoc";
import { InitializeTsDocConfig } from "../utils/tsdoc-config.js";

type BuildOptions = {
  cache?: boolean;
};

/**
 * Runs the necessary functions to build out a project
 */
export function BuildAndTranspileProject(
  directory: string,
  project: ProjectReflection,
  options: {
    /**
     * The docdocs.config.[ext] file changed
     */
    ViteUserConfigChanged: boolean;
    TsDocConfigurationChanged: boolean;
  }
) {
  options = options ?? {};
  BuildVitePressTemplate(directory);
  // copies the dd-vue-components to theme, must run before vitepresstheme index creation since the index creation writes the components that this function creates
  CopyDDTemplateComponentsIntoThemeAtDirectory(directory);
  // copies the custom-vue-components to theme, must run before vitepresstheme index creation since the index creation writes the components that this function creates
  CopyCustomComponentsIntoThemeAtDirectory(directory);
  // setting the default theme in `.vitepress/theme/index.js` (adds global custom components etc...)
  WriteDefaultIndexForVitePressThemeAtDirectory(directory);

  // loads docs from the path of the `DocEntry`
  LoadDocsFromEntryToDirectory(directory);

  if (options.ViteUserConfigChanged) {
    // Reads the `DocDoc` config and applies it to the `ViteConfig`
    CompileViteUserConfig(directory);
    // create team-page if specified
    CreateTeamMembersPageAtDirectory(directory);
  }
  if (options.TsDocConfigurationChanged) {
    // Writes to the `tsdoc.json` file.
    InitializeTsDocConfig(process.cwd());
  }
  // Creates a default HomePage
  CreateIndexHomePageAtDir(directory);
  // Transpile
  transpileProject(project, directory);
}

/**
 *
 */
export default function BuildCommand(program: typeof CommanderProgrammer) {
  program
    .command("build")
    .option(
      "--no-cache",
      "Installs the modules as a new project without using any cached packages."
    )
    .action(async (options: BuildOptions) => {
      await LoadDocDocsConfig();
      const ddconfig = GetDocDocsConfig();
      const app = await BootstrapTypedoc();
      const project = await app.convert();
      if (!project) {
        Console.error("Could not convert typedoc app. project unresolved.");
        process.exit(1);
      }
      SetTypeDocProject(project);
      const BuildId = crypto.randomBytes(20).toString("hex");
      if (options.cache === true) {
        // if we are using cache, then search from the project in cache. If there then copy it and rename it to the `build id`.
        const inCache = GetDocsDocsCacheProject(project.name);
        if (inCache) {
          Console.log(`Building from cache ${inCache}.`);
          fs.cpSync(
            inCache,
            path.join(GetDocDocsRootCacheDirectory(), BuildId),
            { recursive: true, force: true }
          );
        }
      }
      const build = CreateNewDocDocsCacheProject(BuildId);
      BuildAndTranspileProject(build, project, {
        TsDocConfigurationChanged: true,
        ViteUserConfigChanged: true,
      });

      // build vitepress
      execSync(
        `${
          GetPreferredBinExecuteablePM(build).bin
        } vitepress build --outDir=${BuildId}`,
        {
          cwd: build,
          stdio: "inherit",
        }
      );

      fs.cpSync(path.join(build, BuildId), ddconfig.DocsBuildOutput, {
        recursive: true,
        force: true,
      });
      Console.log(`Built docs at ${ddconfig.DocsBuildOutput}`);
      fs.rmSync(build, { recursive: true, force: true });
    });
}
