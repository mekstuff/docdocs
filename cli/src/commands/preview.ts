/**
 * Typed with ❤️ @ mekstuff
 */

import fs from "fs";
import path from "path";
import { program as CommanderProgrammer } from "commander";
import {
  GetDocDocsConfig,
  GetDocsDocsCacheProject,
  LoadDocDocsConfig,
} from "../utils/core.js";
import { Console } from "@mekstuff/logreport";
import { execSync } from "child_process";
import { GetPreferredBinExecuteablePM } from "../utils/get-preferred-package-manager.js";

/**
  Commands
 */
export default function PreviewCommand(program: typeof CommanderProgrammer) {
  program
    .command("preview")
    .option("--port [number]")
    .option("--base [string]")
    .action(async (options: { port?: string; base?: string }) => {
      await LoadDocDocsConfig();
      const DDConfig = GetDocDocsConfig();
      const buildFilePath = path.join(process.cwd(), DDConfig.DocsBuildOutput);
      if (!fs.existsSync(buildFilePath)) {
        Console.error(
          `No build file was found at "${buildFilePath}". You need to build the project first to preview.`
        );
      }
      const packagejsonPath = path.join(process.cwd(), "package.json");
      if (!fs.existsSync(packagejsonPath)) {
        Console.error(`No package.json file exists. "${packagejsonPath}"`);
      }
      const pjson = JSON.parse(fs.readFileSync(packagejsonPath, "utf-8"));
      if (!pjson.name) {
        Console.error(
          `Missing "name" field from package file: ${packagejsonPath}`
        );
      }
      const inCache = GetDocsDocsCacheProject(pjson.name);
      Console.assert(
        inCache,
        `Build of "${pjson.name}" was not found in cache, it is needed to preview your build file. You can only do this by "serving" the project.`
      );
      const previewFolderPath = path.join(
        inCache as string,
        ".docdocs-vitepress-preview;",
        ".vitepress"
      );
      fs.cpSync(buildFilePath, path.join(previewFolderPath, "dist"), {
        recursive: true,
        force: true,
      });
      execSync(
        `${
          GetPreferredBinExecuteablePM(inCache).bin
        } vitepress preview .docdocs-vitepress-preview; ${
          options.base ? `--base=${options.base}` : ""
        } ${options.port ? `--port=${options.port}` : ""}`,

        {
          cwd: inCache,
          stdio: "inherit",
        }
      );
      fs.rmSync(previewFolderPath, { recursive: true, force: true });
    })
    .description("Local preview of your documentation.");
}
