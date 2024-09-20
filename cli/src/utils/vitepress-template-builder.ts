/**
 * Typed with ❤️ @ mekstuff
 */

import fs from "fs";
import path from "path";
import { Console } from "@mekstuff/logreport";
import { execSync } from "child_process";
import {
  GetDocDocsConfig,
  RemoveUnrelatedFilesFromDocsCacheProject,
} from "./core.js";
import { ExpectsInVitePressDirectory } from "./vite-config.js";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { GetPreferredBinExecuteablePM } from "./get-preferred-package-manager.js";
import {
  ReferenceDocDocsConfigurationPath,
  package_import_statemnets,
} from "../configuration.js";
import { h2 } from "../markdown-components/heading.js";
import { admonition } from "../markdown-components/admonition.js";
import { anchor } from "../markdown-components/anchor.js";
import {
  linebreak,
  linebreakWithDashes,
} from "../markdown-components/linebreak.js";

/**
 * Creates a `team` page if specified.
 */
export function CreateTeamMembersPageAtDirectory(directory: string) {
  const DDConfig = GetDocDocsConfig();
  if (DDConfig.TeamPageConfiguration !== undefined) {
    const CompilingTeamPage = Console.log("Compiling team page...");
    Console.assert(
      DDConfig.TeamPageConfiguration.teamMembers,
      `${ReferenceDocDocsConfigurationPath(
        "TeamPageConfiguration"
      )} members were not specified!`
    );
    fs.writeFileSync(
      path.join(
        directory,
        DDConfig.TeamPageConfiguration.teamPageRoute ?? "./team.md"
      ),
      `---
layout: page
---
<script setup>
import {
  VPTeamPage,
  VPTeamPageTitle,
  VPTeamMembers
} from "vitepress/theme";

const members = [
  ${DDConfig.TeamPageConfiguration.teamMembers
    .map(
      (member) =>
        `{avatar: "${member.avatar ?? ""}",
name: "${member.name ?? ""}",
title: "${member.title ?? ""}",
${
  member.links
    ? `links: [${member.links
        .map((link) => `{icon: "${link.icon ?? ""}", link: "${link.link}"}`)
        .join(",")}]`
    : ""
}
}`
    )
    .join(",")}
]

</script>

<VPTeamPage>
  <VPTeamPageTitle>
    <template #title>
      ${DDConfig.TeamPageConfiguration.teamPageHeader ?? "Our Team"}
    </template>
    <template #lead>
      ${DDConfig.TeamPageConfiguration.teamPageLead ?? "_"}
    </template>
  </VPTeamPageTitle>
  <VPTeamMembers
    :members="members"
  />
</VPTeamPage>
      `
    );
    CompilingTeamPage("Team page compiled.");
  }
}

/**
 * Builds out a vitepress project with dependencies and copies the needed `package.json` fields
 * from the cwd to the target directory if any.
 */
export default function BuildVitePressTemplate(directory: string) {
  let DataToWrite = VitePressTemplate_PKGJSON as any; // eslint-disable-line @typescript-eslint/no-explicit-any
  const packageJSONAtCwd = path.join(process.cwd(), "package.json");
  const dirpjson = path.join(directory, "package.json");

  const prevpackageJSON = fs.existsSync(dirpjson)
    ? JSON.parse(fs.readFileSync(dirpjson, "utf-8"))
    : undefined;

  if (prevpackageJSON) {
    DataToWrite = { ...prevpackageJSON, ...DataToWrite };
  }

  if (fs.existsSync(packageJSONAtCwd)) {
    try {
      const _pjson = JSON.parse(fs.readFileSync(packageJSONAtCwd, "utf-8"));
      const dataWeCopy = ["name", "version", "author", "license", "type"];
      dataWeCopy.forEach((d) => {
        const has = _pjson[d];
        if (has === undefined) {
          return;
        }
        DataToWrite[d] = has;
      });
    } catch (err) {
      Console.warn(
        `Failed to read from "${packageJSONAtCwd}" when building vitepress template.`
      );
    }
  }
  const dataString = JSON.stringify(DataToWrite, undefined, 2);

  if (fs.existsSync(dirpjson)) {
    if (fs.readFileSync(dirpjson, "utf-8") === dataString) {
      // same data, no write, no install.
      return;
    }
  }
  fs.writeFileSync(dirpjson, dataString, "utf-8");
  Console.log("Installing dependencies...");
  execSync("yarn", { cwd: directory, stdio: "inherit" }); // TODO: Get preferred package manager.
}

/**
 * Maps the valid files as a tree that can be used for automatic sidebars
 *
 * Note that validFiles are looped backwards, meaning that the file at index [0] should be the last file.
 *
function MapValidFilesAsTree(
  validFiles: string[],
  directory: string,
  initialPath: string
) {
  type _item = {
    children: _item[];
    name: string;
  };
  const Root: _item = {
    name: "root",
    children: [],
  };
  for (let index = validFiles.length - 1; index >= 0; index--) {
    const file = validFiles[index];
    // const filePaths = file;
    const targetDir = path.join(
      directory,
      path.parse(path.relative(initialPath, file)).dir
    );
    const fileDir =
      targetDir === directory
        ? "/"
        : targetDir.split(directory)[1].replace(/\\/g, "/");

    if (fileDir === "/") {
      const alreadyInRootDir = Root.children.find((f) => f.name === "/");
      if (alreadyInRootDir) {
        alreadyInRootDir.children.push({
          name: file,
          children: [],
        });
      } else {
        Root.children.push({
          name: "/",
          children: [{ name: file, children: [] }],
        });
      }
    } else {
      const fileDirPaths = fileDir.split("/");
      let _lastitemPath: _item | undefined;
      fileDirPaths.forEach((path, index) => {
        if (index === 0) {
          return;
        }
        console.log("fz");
        if (_lastitemPath === undefined) {
          console.log("fe");
          const pathInRoot = Root.children.find((f) => (f.name = path));
          console.log(pathInRoot === undefined, pathInRoot);
          if (pathInRoot) {
            _lastitemPath = pathInRoot;
          } else {
            console.log("adding path to root ", path);
            _lastitemPath = {
              name: path,
              children: [],
            };
            Root.children.push(_lastitemPath);
          }
        }
        if (index === fileDirPaths.length - 1) {
          // if (!_lastitemPath) {
          //   Console.error(
          //     "There was an error when mapping file directories as tree. the `_lastitemPath` was not defined."
          //   );
          //   return;
          // }
          // _lastitemPath.children.push({
          //   name: file,
          //   children: [],
          // });
        }
      });
    }
  }
  console.log("---JSON BELOW---");
  console.log(JSON.stringify(Root));
}
*/
/**The default `package.json` source for vitepress directory*/
const VitePressTemplate_PKGJSON = {
  name: "@mekstuff/docdocs-vitepress-template",
  version: "1.0.0",
  devDependencies: {
    vitepress: "^1.0.0-rc.22",
  },
  scripts: {},
};

/**
 * Copies valid files from the `./docs` (or user defined) docsEntry point and places them into directory
 */
export function LoadDocsFromEntryToDirectory(directory: string) {
  const DocsCompilerLog = Console.log("Compiling docs...");
  const validFiles: string[] = [];
  const ddconfig = GetDocDocsConfig();
  const initialPath = path.join(process.cwd(), ddconfig.DocsEntry);
  function recursiveGetFiles(rootPath: string) {
    if (fs.existsSync(rootPath)) {
      const stats = fs.lstatSync(rootPath);
      if (stats.isDirectory()) {
        fs.readdirSync(rootPath).forEach((x) => {
          if (initialPath === rootPath) {
            if (x === "api" && ddconfig.ApiReference.noApiReference !== true) {
              Console.error(
                `You cannot create an "api/" directory within your docs while having ${ReferenceDocDocsConfigurationPath(
                  "ApiReference.noApiReference"
                )} set to false.`
              );
            }
          }
          if (x === ".components") {
            // custom components are ignored and loaded with `CopyCustomComponentsIntoThemeAtDirectory`
            return;
          }
          recursiveGetFiles(path.join(rootPath, x));
        });
      } else {
        const parsed = path.parse(rootPath);
        const rel = path.relative(initialPath, rootPath);
        // Prohibts copy of .vue files
        // Choose to become a sponsor to use .vue files within your docs
        // You can also remove this check to bypass the error, though you will need to on every update unless you fork the repo.
        // Becoming a sponsor helps both us and you ❤️
        if (parsed.ext === ".vue") {
          Console.error(
            `Remove the file "${rel}"\n\nTo use custom ".vue" files you must become a Sponsor\n(https://mekstuff.com/docdocs/sponsor).\n\nYou can also fork the repo and remove the check (not recommended 😭).`
          );
        }
        // Do not remove, prevents conflict between auto build index.md and user added. Use configuration to change home page.
        /* Not needed anymore since files are copied as docs/index.md -> docs/index.md instead of docs/index.md -> index.md
         */
        if (rel === "index.md" || rel === "index.html") {
          Console.error(
            `You cannot create an index.md file at the root level, Home pages are created through docdocs configuration.`
          );
        }
        validFiles.push(rootPath);
      }
    }
  }

  recursiveGetFiles(initialPath);
  RemoveUnrelatedFilesFromDocsCacheProject(directory);

  if (validFiles.length === 0) {
    // default getting started for assisting the developer.
    fs.writeFileSync(
      path.join(directory, "getting-started.md"),
      DEFAULT_GETTING_STARTED_MD
    );
  }

  validFiles.forEach((x) => {
    // the target dir will be the directory relative to the directory provided in arg0, since we only receive files from
    // recursive copy, we need to make nested files have there parent directories created on the arg0 directory.
    const targetDir = path.join(
      directory,
      // ddconfig.DocsEntry, // route to the DocEntry, so if doc entry is `/docs`  then output should be inside of a `/docs` folder and not the root of the directory.
      path.parse(path.relative(initialPath, x)).dir
    );
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    fs.cpSync(x, path.join(targetDir, path.parse(x).base));
  });

  DocsCompilerLog("Docs Compiled.");
}

/**
 * Creates an `index.md` file in the given directory if non exists.
 *
 * @returns if the directory is created
 */
export function CreateIndexHomePageAtDir(directory: string): boolean {
  const p = path.join(directory, "index.md");
  const ddconfig = GetDocDocsConfig();
  const HomePageConfiguration = ddconfig.HomePageConfiguration;

  try {
    fs.writeFileSync(
      p,
      `---
layout: home

hero:
  name: ${HomePageConfiguration.name ?? "..."}
  text: ${HomePageConfiguration.text ?? "..."}
  tagline: ${HomePageConfiguration.tagline ?? "..."} 
  image:
    # src: /logo.png
    alt: home-page-logo

  ${
    HomePageConfiguration.actions
      ? `actions:
  ${HomePageConfiguration.actions
    .map(
      (x) =>
        `- theme: ${x.theme ?? "brand"}
    text: ${x.text}
    link: ${x.link}`
    )
    .join("\n  ")}
  `
      : ""
  }

features:
  ${
    HomePageConfiguration.features
      ? HomePageConfiguration.features
          .map(
            (x) =>
              `- icon: ${x.icon ?? ""}
    title: ${x.title ?? ""}
    details: ${x.details ?? ""}
    link: ${x.link ?? ""}
    linkText: ${x.linkText ?? ""}
    rel: ${x.rel ?? ""}`
          )
          .join("\n  ")
      : ""
  }
---`,
      "utf-8"
    );
    return true;
  } catch {
    return false;
  }
}

/**
 * Copies the `.components` template into the `.vitepress/theme` directory
 */
export function CopyCustomComponentsIntoThemeAtDirectory(directory: string) {
  const DDConfig = GetDocDocsConfig();
  const componentsPath = path.join(
    path.resolve(DDConfig.DocsEntry),
    ".components"
  );
  const ThemeFolder = ExpectsInVitePressDirectory(directory, "theme");
  const resPath = path.join(ThemeFolder, "custom-components");
  if (fs.existsSync(resPath)) {
    fs.rmSync(resPath, { force: true, recursive: true });
  }
  if (fs.existsSync(componentsPath)) {
    fs.cpSync(componentsPath, resPath, {
      recursive: true,
      force: true,
    });
  }
}

/**
 * Copies the `dd-cimponents` template into the `.vitepress/theme` directory
 */
export function CopyDDTemplateComponentsIntoThemeAtDirectory(
  directory: string
) {
  const ThemeFolder = ExpectsInVitePressDirectory(directory, "theme");
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const node_modules = path.resolve(
    __dirname,
    "..",
    "..",
    "node_modules"
    // "components"
  );
  // const templates = path.resolve(__dirname, "..", "..", "templates");
  // if (!fs.existsSync(templates)) {
  //   Console.error(`Could not resolve templates. ${templates}`);
  // }
  const dd_vue_components = path.join(
    node_modules,
    "@mekstuff",
    "docdocs-front-end",
    "components"
  );
  if (!fs.existsSync(dd_vue_components)) {
    Console.error(`Could not resolve components. ${dd_vue_components}`);
  }
  const resPath = path.join(ThemeFolder, "dd-components");
  fs.cpSync(dd_vue_components, resPath, {
    recursive: true,
    force: true,
  });
}

/**
 * Writes to the `index.js` file of the `.vitepress/theme` directory
 */
export function WriteDefaultIndexForVitePressThemeAtDirectory(
  directory: string
) {
  const ThemeFolder = ExpectsInVitePressDirectory(directory, "theme");
  const tp = path.join(ThemeFolder, "index.js");
  const gc = DEFAULT_THEME_EXTEND_REGISTER_GLOBAL_COMPONENTS(
    ThemeFolder,
    directory
  );
  if (fs.existsSync(tp)) {
    const r = fs.readFileSync(tp, "utf-8");
    // do not write the same file twice to prevent reload
    if (r === gc) {
      return;
    }
  }
  fs.writeFileSync(path.join(ThemeFolder, "index.js"), gc);
}

/**
 * Installs the themes to the directory using a package manager.
 * TODO: If x is installed then we added y to packages it doesn't seem to detect the enw y, Fi
 * ^^ happened with ["vitepress-sidebar", "vitepress-shopware-docs"] where the 2nd one was added after.
 *
 * TODO: They're not installed in package.json, maybe since we write to the package json everytime now! fix.
 */
function InstallUserSpecifiedThemes(
  directory: string,
  theme: string[] | undefined
) {
  const _PM = GetPreferredBinExecuteablePM(directory);
  const themeCacheInfoPath = path.join(
    directory,
    ".docdocs-vite-theme-info.json"
  );
  let PreviousInstalledThemes: string[] = [];
  let HadPreviousInstalledThemes = false;
  if (fs.existsSync(themeCacheInfoPath)) {
    PreviousInstalledThemes = JSON.parse(
      fs.readFileSync(themeCacheInfoPath, "utf-8")
    );
    HadPreviousInstalledThemes = true;
  }
  if (
    HadPreviousInstalledThemes &&
    PreviousInstalledThemes.every((item) => theme?.includes(item))
  ) {
    // same modules/packages, no need to install.
    return;
  }
  const NoLongerUsedThemes = theme
    ? PreviousInstalledThemes.map((x) => {
        if (theme?.indexOf(x) === -1) {
          return x;
        }
      }).filter(Boolean)
    : PreviousInstalledThemes;
  if (NoLongerUsedThemes.length > 0) {
    Console.info(`Uninstalling previous themes: ${NoLongerUsedThemes.join()}`);
    try {
      execSync(`${_PM.remove} ${NoLongerUsedThemes.join(" ")}`, {
        stdio: "inherit",
        cwd: directory,
      });
    } catch (err) {
      Console.warn(`Error while removing previous themes.\n${err}`);
    }
  }
  if (theme) {
    Console.info(`Installing themes: ${theme.join()}`);
    try {
      execSync(`${_PM.add} ${theme.join(" ")}`, {
        stdio: "inherit",
        cwd: directory,
      });
    } catch (err) {
      Console.warn(`Error while installing themes.\n${err}`);
    }
  }
  if (theme && theme.length > 0) {
    fs.writeFileSync(themeCacheInfoPath, JSON.stringify(theme));
  } else {
    fs.rmSync(themeCacheInfoPath, { force: true, recursive: true });
  }
}

/**
 * Registering Global Components
 * Placed into `.vitepress/theme/index.js`.
 */
const DEFAULT_THEME_EXTEND_REGISTER_GLOBAL_COMPONENTS = (
  viteThemeDirectory: string,
  directory: string
): string => {
  const DDConfig = GetDocDocsConfig();
  InstallUserSpecifiedThemes(directory, DDConfig.ViteTheme?.packages);
  // TODO: Components name validation: only allow characters[A-Z]
  const ddComponentsPath = path.join(viteThemeDirectory, "dd-components");
  const customComponentsPath = path.join(
    viteThemeDirectory,
    "custom-components"
  );
  let importComponentsString = "";
  let registerComponentsString = "";
  const registeredNames: string[] = [];
  if (fs.existsSync(ddComponentsPath)) {
    const dir = fs.readdirSync(ddComponentsPath);
    const ccdir = fs.existsSync(customComponentsPath)
      ? fs.readdirSync(customComponentsPath)
      : undefined;

    importComponentsString = dir
      .map((x) => {
        const parsed = path.parse(x);
        registeredNames.push(parsed.name);
        return `import ${parsed.name} from "./dd-components/${x}";`;
      })
      .join("\n");
    registerComponentsString = dir
      .map((x) => {
        const parsed = path.parse(x);
        return `ctx.app.component("${parsed.name}", ${[parsed.name]});`;
      })
      .join("\n\t\t");

    // custom components import
    if (ccdir) {
      importComponentsString +=
        "\n //custom components\n" +
        ccdir
          .map((x) => {
            const parsed = path.parse(x);
            if (registeredNames.indexOf(parsed.name) !== -1) {
              Console.error(
                `The component "${parsed.name}" was already registered as a global component, Rename component and try again.`
              );
            }
            return `import ${parsed.name} from "./custom-components/${x}";`;
          })
          .join("\n");
    }
    // custom components registration
    if (ccdir) {
      registerComponentsString +=
        "\n// custom components\n" +
        ccdir
          .map((x) => {
            const parsed = path.parse(x);
            return `ctx.app.component("${parsed.name}", ${[parsed.name]});`;
          })
          .join("\n");
    }
  }

  return `/* This file is automatically generated by DocDocs, You should not edit it directly.\n\n Made with ❤ By @mekstuff */
import DefaultTheme from 'vitepress/theme'
${
  DDConfig.ViteTheme
    ? DDConfig.ViteTheme.import
      ? `// user-imports
${_compileImportStatements(DDConfig.ViteTheme.import)}`
      : ""
    : ""
}
${
  DDConfig.ViteTheme
    ? DDConfig.ViteTheme.source
      ? `// user-source
${DDConfig.ViteTheme.source}`
      : ""
    : ""
}
// dd-components
${importComponentsString}
export default {
  extends: DefaultTheme, // this is placed at that top so any other extends: will override it.
  ${
    DDConfig.ViteTheme
      ? DDConfig.ViteTheme.export
        ? `// user-export
${DDConfig.ViteTheme.export.map((x) => x).join(",\n")},`
        : ""
      : ""
  }
  enhanceApp(ctx) {
    // dd-components
    ${registerComponentsString}
    ${
      DDConfig.ViteTheme
        ? DDConfig.ViteTheme.enhance
          ? `// user-enhanceApp
          ${DDConfig.ViteTheme.enhance}`
          : ""
        : ""
    }
  }
}
  `;
};

export function _compileImportStatements(imports: package_import_statemnets) {
  return imports
    .map((x) =>
      typeof x === "string"
        ? `import "${x}";`
        : `import ${!x.default ? "{" : ""} ${x.p} ${
            !x.default ? "}" : ""
          } from "${x.from}"` + ";"
    )
    .join("\n");
}

/**
 * Default getting started markdown source
 */
const DEFAULT_GETTING_STARTED_MD = `# Getting Started

${admonition(
  "This file is automatically generated and only exists whenever you have no files within your `" +
    ReferenceDocDocsConfigurationPath("DocsEntry") +
    "` directory.",
  "warning"
)}


${h2("What is DocDocs")}

\`DocDocs\` is a \`cli\` tool that enables developers to generate ${anchor(
  "vitepress",
  "https://www.vitepress.dev",
  "_blank"
)} documentation websites from source code. It uses ${anchor(
  "TypeDoc",
  "https://typedoc.org/",
  "_blank"
)} from the typescript team to extract documentations from your \`classes/functions/interfaces etc.\`
${linebreak()}
This is just a brief overview of \`DocDocs\`, For in depth documentation and examples check out the ${anchor(
  "website",
  "docdocs.mekstuff.com",
  "_blank"
)}.

${h2("Contribute To DocDocs")}
DocDocs is an open source project, you can contribute by reporting bugs, writing code, optimizing code, etc. on github! ${anchor(
  "DocDocs Github Repository",
  "https://github.com/mekstuff/docdocs",
  "_blank"
)}

You can also contribute by following our socials ${anchor(
  "@mekstuff",
  "https://twitter.com/mekstuff",
  "_blank"
)} and checking out our ${anchor(
  "projects",
  "https://github.com/mekstuff",
  "_blank"
)}!

Want to donate to us? ${anchor(
  "Donate",
  "https://ko-fi.com/mekstuff",
  "_blank"
)}.
${linebreakWithDashes()}
Made with ❤️ by mekstuff
`;
