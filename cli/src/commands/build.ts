/**
 * Typed with ❤️ @ mekstuff
 */

import fs from "fs";
import path from "path";
import crypto from "crypto";
import { Console } from "@mekstuff/logreport";
import { execSync } from "child_process";
import { transpileProject } from "../utils/transpiler.js";
import { ProjectReflection } from "typedoc";
import { CompileViteUserConfig } from "../utils/vite-config.js";
import { InitializeTsDocConfig } from "../utils/tsdoc-config.js";
import { program as CommanderProgrammer } from "commander";
import { GetPreferredBinExecuteablePM } from "../utils/get-preferred-package-manager.js";

import {
  CreateNewDocDocsCacheProject,
  GetDocDocsConfig,
  GetDocDocsRootCacheDirectory,
  GetDocsDocsCacheProject,
  LoadDocDocsConfig,
} from "../utils/core.js";
import BuildVitePressTemplate, {
  CopyCustomComponentsIntoThemeAtDirectory,
  CopyDDTemplateComponentsIntoThemeAtDirectory,
  CreateIndexHomePageAtDir,
  CreateTeamMembersPageAtDirectory,
  LoadDocsFromEntryToDirectory,
  WriteDefaultIndexForVitePressThemeAtDirectory,
} from "../utils/vitepress-template-builder.js";
import BootstrapTypedoc, {
  SetTypeDocProject,
} from "../utils/typedoc-bootstrap.js";

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
    // Reads the `DocDoc` config and applies it to the `ViteConfig`. (newVer: also compiles the .vitepress user defined config)
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
      // start the project
      await LoadDocDocsConfig();
      const ddconfig = GetDocDocsConfig();
      const app = await BootstrapTypedoc();
      const project = await app.convert();
      if (!project) {
        Console.error("Could not convert typedoc app. project unresolved.");
        process.exit(1);
      }
      SetTypeDocProject(project);
      const BuildId = crypto.randomBytes(20).toString("hex"); //create a temporary build id to where the build will initial be created before copied to output.
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
      // copy from temporary buildid output to ddconfig build output.
      fs.cpSync(path.join(build, BuildId), ddconfig.DocsBuildOutput, {
        recursive: true,
        force: true,
      });
      Console.log(`Built docs at ${ddconfig.DocsBuildOutput}`);
      fs.rmSync(build, { recursive: true, force: true });
    })
    .description(
      "Builds out the project at ddconfig.DocsBuildOutput using vitepress. By default it will use any cache of this project it finds but you can override it by passing the --no-cache flag."
    );
}
