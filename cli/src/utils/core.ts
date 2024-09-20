/**
 * Typed with ❤️ @ mekstuff
 */

import os from "os";
import fs from "fs";
import url from "url";
import path from "path";

import { Console } from "@mekstuff/logreport";
import { DocDocsConfiguration } from "../configuration.js";
import { comment } from "../markdown-components/comment.js";

/**
 * Returns the `.dcodocs` root path. `./~/.docdocs`
 *
 * Creates it if it doesn't exists already
 */
export function GetDocDocsRootDirectory(): string {
  const DDRPath = path.join(os.homedir(), ".docdocs");
  if (!fs.existsSync(DDRPath)) {
    try {
      fs.mkdirSync(DDRPath, { recursive: true });
    } catch (err) {
      Console.error(`Could not create root directory: ${err}`);
      process.exit(1);
    }
  }
  return DDRPath;
}

/**
 * Returns the `.docdocs/cache` root path.
 *
 * Creates it if it doesn't exists already
 */
export function GetDocDocsRootCacheDirectory(): string {
  const CachePath = path.join(GetDocDocsRootDirectory(), "cache");
  if (!fs.existsSync(CachePath)) {
    try {
      fs.mkdirSync(CachePath, { recursive: true });
    } catch (err) {
      Console.error(`Could not create root cache directory: ${err}`);
      process.exit(1);
    }
  }
  return CachePath;
}

/**
 * Gets the version of vitepress that is used in a cached project
 */
export function GetVitePressVersionOfCachedProject(
  directory: string
): string | undefined {
  try {
    const pj = JSON.parse(
      fs.readFileSync(path.join(directory, "package.json"), "utf-8")
    );
    return pj.version;
  } catch {
    return;
  }
}
/**
 * Removes all unrelated files from the cache/project directory
 */
export function RemoveUnrelatedFilesFromDocsCacheProject(directory: string) {
  const IgnoreFiles = [
    "index.md",
    ".vitepress",
    "api",
    "node_modules",
    "package.json",
    "yarn.lock",
    "package-lock.json",
    "pnpm-lock.yaml",
    "bun.lockb",
    ".docdocs-vite-theme-info.json",
    // ".docdocs-vitepress-preview;" preview folder, we let serve remove it, for future reference we can change this behaviour
  ];
  if (fs.existsSync(directory)) {
    fs.readdirSync(directory).forEach((x) => {
      if (IgnoreFiles.indexOf(path.parse(x).base) === -1) {
        try {
          fs.rmSync(path.join(directory, x), { force: true, recursive: true });
        } catch (err) {
          Console.warn(err);
        }
      }
    });
  }
}

/**
 * Returns the path of the project if it exists in the cache directory
 */
export function GetDocsDocsCacheProject(name: string): string | undefined {
  name = name.replace(/\//g, "--");
  const p = path.join(GetDocDocsRootCacheDirectory(), name);
  if (fs.existsSync(p)) {
    return p;
  }
  return undefined;
}
/**
 * Builds a new project in cache
 */
export function CreateNewDocDocsCacheProject(
  name: string,
  ignoreCache?: boolean
): string {
  name = name.replace(/\//g, "--");
  const p = path.join(GetDocDocsRootCacheDirectory(), name);
  if (fs.existsSync(p)) {
    if (!ignoreCache) {
      return p;
    }
  }
  try {
    fs.rmSync(p, { force: true });
    fs.mkdirSync(p, { recursive: true });
  } catch (err) {
    Console.error(err);
  }

  return p;
}

/**
 * Returns the `docdocs.config.[ext]` joined to the given dir
 */
export function GetDocDocsConfigDir(cwd?: string) {
  return path.join(cwd ? cwd : process.cwd(), "docdocs.config.js");
}

/**
 * To remove the caching of the `docdocs.config.[ext]` file, add this index on each import query param then
 * increment it.
 *
 * NOTE: This method may cause memory leaks potentially if each imported module is kept and not garbage collected.
 * Deleting the path from require.cache using `{ createRequire }` does not seem to work, this will be a preferred methid,
 * but will have to look into why it doesn't work in this case.
 */
let DocDocsConfigImportIndex = 0;

let CurrentDocDocsConfig: DocDocsConfiguration | undefined;
/**
 * Loads the `docdoc.config.[ext]` file and stores it in a variable
 *
 * We opt to using this to prevent having to make every function `async` with `GetDocDocsConfig`. So instead we Load the config
 * on start or whenever file changes (for dev mode)
 */
export async function LoadDocDocsConfig(): Promise<DocDocsConfiguration> {
  const p = GetDocDocsConfigDir(process.cwd());
  if (!fs.existsSync(p)) {
    Console.error(
      `file was not found: "${p}". Run "docdocs init" to initialize a new project.`
    );
    process.exit(1);
  }
  const importpath = url.pathToFileURL(p).toString();
  try {
    const res = await import(
      importpath + `?cache-index=${DocDocsConfigImportIndex}`
    );
    DocDocsConfigImportIndex++;
    const def = res.default as DocDocsConfiguration;
    if (typeof def !== "object") {
      throw `default value of module is not an object. Did you export default Config?`;
    }
    CurrentDocDocsConfig = def;
    return def;
  } catch (err) {
    Console.error(err);
    process.exit(1);
  }
}

/**
 * Reads the `docdocs.config.[ext]` file
 */
export function GetDocDocsConfig(): DocDocsConfiguration {
  if (!CurrentDocDocsConfig) {
    Console.error("Config was not loaded prior to `GetDocDocsConfig` call.");
    process.exit(1);
  }
  return CurrentDocDocsConfig;
  /*
  const p = GetDocDocsConfigDir(cwd);
  if (!fs.existsSync(p)) {
    Console.error(`file was not found: "${p}".`);
    process.exit(1);
  }
  const importpath = url.pathToFileURL(p).toString();
  return import(importpath + `?cache-index=${DocDocsConfigImportIndex}`).then(
    (res) => {
      DocDocsConfigImportIndex++;

      const def = res.default as DocDocsConfiguration;
      if (typeof def !== "object") {
        throw `default value of module is not an object. Did you export default Config?`;
      }
      return def;
    }
  );
  */
}

/**
 * Removes the `api` route if it exiss
 */
export function RemoveApiRoute(directory: string) {
  const ApiRoutePath = path.join(directory, "api");
  if (fs.existsSync(ApiRoutePath)) {
    fs.rmSync(ApiRoutePath, { recursive: true, force: true });
  }
}

/**
 * Creates the api route if it doesn't exist
 */
function CreateApiRoute(directory: string): string {
  const ApiRoutePath = path.join(directory, "api");
  if (!fs.existsSync(ApiRoutePath)) {
    fs.mkdirSync(ApiRoutePath);
  }
  return ApiRoutePath;
}

/**
 * Creates a sub route under the api route.
 */
function CreateSubApiRoute(directory: string, RouteName: string): string {
  const TargetRoute = path.join(CreateApiRoute(directory), RouteName);
  if (!fs.existsSync(TargetRoute)) {
    fs.mkdirSync(TargetRoute);
  }
  return TargetRoute;
}

export type SupportedApiRoutes =
  | "class"
  | "function"
  | "module"
  | "interface"
  | "type";

/**
 * Gets the sub api route, returns undefined if it doesn't exists.
 */
export function GetSubApiRoute(
  directory: string,
  route: SupportedApiRoutes
): string | undefined {
  const SubApiRoutePath = path.join(directory, "api", route);
  if (fs.existsSync(SubApiRoutePath)) {
    return SubApiRoutePath;
  }
}

/**
 * Adds to api route.
 *
 * NOTE: file names and extensions are converted `toLowerCase()`. so when routing make sure to use the `toLowerCase()` on the file.
 */
export function AddToApiRoute(
  directory: string,
  route: SupportedApiRoutes,
  fileName: string,
  fileExtension: ".md",
  source: string
) {
  const TargetRoute = CreateSubApiRoute(directory, route);
  /**
   * Api Routes need deeper outline than default, e.g  class.properties.property will be displayed instead of class.properties.
   */
  source =
    `---\noutline: [2,3]\n---\n${comment(
      "^ sidebar nesting levels for api route are specified on each page. ^"
    )}\n` + source;
  fs.writeFileSync(
    path.join(
      TargetRoute,
      fileName.toLowerCase() + fileExtension.toLocaleLowerCase()
    ),
    source,
    "utf-8"
  );
}
