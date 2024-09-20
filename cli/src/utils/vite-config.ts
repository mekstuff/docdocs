/**
 * Typed with ❤️ @ mekstuff
 */

import fs from "fs";
import path from "path";
import TypeDoc from "typedoc";
import { UserConfig, DefaultTheme } from "vitepress";
import { GetDocDocsConfig, SupportedApiRoutes } from "./core.js";
import { Console } from "@mekstuff/logreport";
import pluralize from "pluralize";
import { ResolveReflectionNameForPathUrl } from "./transpiler.js";
import { ReferenceDocDocsConfigurationPath } from "../configuration.js";
import { _compileImportStatements } from "./vitepress-template-builder.js";

/**
 * Adds thr `.vitepress` directory to the given directory if it doesn't exist already.
 *
 * @returns The path of the directory
 */
function ExpectsVitePressDirectory(directory: string): string {
  const p = path.join(directory, ".vitepress");
  if (!fs.existsSync(p)) {
    fs.mkdirSync(p, { recursive: true });
  }
  return p;
}
/**
 * Expects the directory/file to exist in the `.vitepress/` directory, will create it if it doesn't exist
 *
 * @returns The path of the directory
 */
export function ExpectsInVitePressDirectory(
  directory: string,
  target: string
): string {
  const vp = ExpectsVitePressDirectory(directory);
  const p = path.join(vp, target);
  if (!fs.existsSync(p)) {
    fs.mkdirSync(p, { recursive: true });
  }
  return p;
}

/**
 * Gets the proxy json file for config, since the `UserConfig` is a js object, we only read from this JSON file,
 * when we write we write to the JSON file then export default from its data to the `UserConfig`.
 */
function GetViteProxyUserConfigPathForDirectory(directory: string): string {
  return path.join(directory, ".vitepress", ".docdocs-vpcg.json");
}
/**
 * Reads the config `.docdocs-vpcg.json` file instead of actual config file.
 */
function ReadViteProxyUserConfig(directory: string): UserConfig | undefined {
  const p = GetViteProxyUserConfigPathForDirectory(directory);
  if (fs.existsSync(p)) {
    return JSON.parse(fs.readFileSync(p, "utf-8"));
  }
}
/**
 * Joins the `directory` with the `viteConfigPath`
 */
function GetViteUserConfigPathForDirectory(directory: string): string {
  return path.join(directory, ".vitepress", "config.js");
}

/**
 * Writes a config file to `<root>/.vitepress/config.[ext]`.
 */
export function WriteViteUserConfig(directory: string, config: UserConfig) {
  let stringed = JSON.stringify(config, undefined, 2);
  ExpectsVitePressDirectory(directory);
  // initializes default
  fs.writeFileSync(
    GetViteProxyUserConfigPathForDirectory(directory),
    stringed,
    "utf-8"
  );

  // import statements
  const ddconfig = GetDocDocsConfig();
  const import_statements = ddconfig.ViteTheme?.config_import
    ? _compileImportStatements(ddconfig.ViteTheme?.config_import) + "\n\n"
    : "";

  // extracting & writing template strings
  // TODO: There must be a better way to do this, Tired when written :(
  const strtemplates = stringed.match(/"\$!{(.+)}!"/g);
  if (strtemplates) {
    strtemplates.forEach((t) => {
      const _m = t.match(/\$!{(.+)}!/);
      if (!_m) {
        Console.warn(
          "Something went wrong with a string template. Could not match value."
        );
        return;
      }
      stringed = stringed.replace(t, _m[1].replace(/\\n/g, ""));
    });
  }
  // writing
  const c = `/* Generated with ❤ By DocsDocs from @mekstuff */\n${import_statements}export default ${stringed}`;
  const ViteUserConfigPath = GetViteUserConfigPathForDirectory(directory);
  if (fs.existsSync(ViteUserConfigPath)) {
    const previousstringed = fs.readFileSync(ViteUserConfigPath, "utf-8");
    // same data, don't write since writing will cause vitepress to detect change and make unnecessary reload to webpage.
    if (previousstringed === c) {
      return;
    }
  }
  fs.writeFileSync(ViteUserConfigPath, c, "utf-8");
}

/**
 * @returns true if the value was set.
 */
export function SetViteUserConfigTitle(
  directory: string,
  title: string | boolean
): boolean {
  const config = ReadViteProxyUserConfig(directory);
  if (config === undefined) {
    return false;
  }
  config.themeConfig = config.themeConfig ?? {};
  config.themeConfig.siteTitle = title;

  WriteViteUserConfig(directory, config);
  return true;
}

/**
 * @returns true if the value was set.
 */
export function SetViteUserConfigLogo(
  directory: string,
  logo: string
): boolean {
  const config = ReadViteProxyUserConfig(directory);
  if (config === undefined) {
    return false;
  }
  config.themeConfig = config.themeConfig ?? {};
  config.themeConfig.logo = logo;

  WriteViteUserConfig(directory, config);
  return true;
}

/**
 * adds the api to the sidebar
 */
export function ResolveApiSidebar(
  directory: string,
  reflections: {
    Classes: TypeDoc.Models.Reflection[];
    Functions: TypeDoc.Models.Reflection[];
    Interfaces: TypeDoc.Models.Reflection[];
    Types: TypeDoc.Models.Reflection[];
    Modules: TypeDoc.Models.Reflection[];
  }
) {
  const config = ReadViteProxyUserConfig(directory);
  const DDConfig = GetDocDocsConfig();
  if (DDConfig.ApiReference.noApiSidebar) {
    return;
  }
  if (config === undefined) {
    Console.warn(
      `Could not resolve api sidebar because no config was found. "${directory}"`
    );
    return false;
  }
  config.themeConfig = config.themeConfig ?? {};
  config.themeConfig.sidebar = config.themeConfig.sidebar ?? {};
  const sidebar = config.themeConfig.sidebar as DefaultTheme.Sidebar;
  if (Array.isArray(sidebar)) {
    Console.error(
      `You cannot use an array for sidebar while having ${ReferenceDocDocsConfigurationPath(
        "ApiReference.noApiReference"
      )} set to false. Use a dictionary instead\n\nlearn more: https://vitepress.dev/reference/default-theme-sidebar#multiple-sidebars`
    );
  } else {
    sidebar["/api/"] = [];
    let SidebarCategorizeType =
      DDConfig.ApiReference.sidebarConfiguration.categorize;

    /**
     * Gets the `@ddapi` tag text if any exists.
     */
    const getddapi_tagname = (
      reflection: TypeDoc.Models.DeclarationReflection
    ): string | undefined => {
      const ddapiBlockTag =
        reflection.signatures && reflection.signatures[0] // The comment blockTag we need will be inside the singature if reflection is a function reflection.
          ? reflection.signatures[0].comment?.blockTags.find(
              (x) => x.tag === "@ddapi"
            )
          : reflection.comment?.blockTags.find((x) => x.tag === "@ddapi");
      return ddapiBlockTag && ddapiBlockTag.content[0]?.text;
    };

    const SidebarItems: Record<string, DefaultTheme.SidebarItem> = {};

    const addToSidebarItems = (
      group: string,
      groupname: string,
      item: DefaultTheme.SidebarItem
    ) => {
      if (SidebarItems[group]) {
        SidebarItems[group].items!.push(item); //eslint-disable-line @typescript-eslint/no-non-null-assertion
      } else {
        SidebarItems[group] = {
          text: groupname,
          collapsed: true,
          items: [item],
        };
      }
    };

    const toUpperCaseFirstLetter = (t: string): string => {
      return t.charAt(0).toUpperCase() + t.slice(1);
    };

    function _(
      i:
        | typeof reflections.Classes
        | typeof reflections.Functions
        | typeof reflections.Interfaces
        | typeof reflections.Types,
      route: SupportedApiRoutes
    ) {
      i.forEach((x) => {
        if (x.isDeclaration()) {
          const _defaultitem = {
            text: x.name,
            link: `api/${route}/${ResolveReflectionNameForPathUrl(x.name)}`,
          };
          if (DDConfig.ApiReference.sidebarConfiguration.forEach) {
            const _ddapi = getddapi_tagname(x);
            const res = DDConfig.ApiReference.sidebarConfiguration.forEach({
              name: x.name,
              route: route,
              isDeprecated: x.isDeprecated(),
              ddapi: _ddapi,
              sources: x.sources
                ? x.sources.map((s) => {
                    return {
                      fileName: s.fileName,
                      fullFileName: s.fullFileName,
                      relativePath: path
                        .relative(process.cwd(), s.fullFileName)
                        .replace(/\\/g, "/"),
                      relativeDirectory: path
                        .relative(
                          process.cwd(),
                          path.dirname(s.fullFileName).split(path.sep).pop()! //eslint-disable-line @typescript-eslint/no-non-null-assertion
                        )
                        .replace(/\\/g, "/"),
                    };
                  })
                : [],
            });
            if (res !== undefined) {
              Console.assert(
                typeof res === "string",
                `${ReferenceDocDocsConfigurationPath(
                  "ApiReference.sidebarConfiguration.forEach"
                )} function expected to return a string, got ${typeof res}`
              );
              if (res.match(/^\$/)) {
                SidebarCategorizeType = res.slice(
                  1
                ) as typeof SidebarCategorizeType;
              } else {
                addToSidebarItems(res, res, _defaultitem);
                return;
              }
            }
          }

          // sibling api sidebar
          if (SidebarCategorizeType === "sibling") {
            const tagName = getddapi_tagname(x) ?? pluralize(route);
            addToSidebarItems(
              tagName,
              toUpperCaseFirstLetter(tagName),
              _defaultitem
            );
            return;
          }
          // dir api sidebar
          if (
            typeof SidebarCategorizeType === "string" &&
            SidebarCategorizeType.match(/^dir/)
          ) {
            const ddapiTag = getddapi_tagname(x);
            if (ddapiTag) {
              addToSidebarItems(
                ddapiTag,
                toUpperCaseFirstLetter(ddapiTag),
                _defaultitem
              );
              return;
            }
            const dir_level = Number(
              SidebarCategorizeType.split("-")[1]
                .replace("[", "")
                .replace("]", "")
            );
            Console.assert(
              dir_level >= 1,
              `dir level for ${ReferenceDocDocsConfigurationPath(
                "ApiReference.sidebarConfiguration.categorize"
              )} cannot be < 1. You specified: ${dir_level}`
            );
            const firstSource = x.sources?.[0];
            if (firstSource) {
              const n = firstSource.fullFileName
                .split("/")
                .reverse()
                .slice(1, dir_level)
                .reverse()
                .join("/");
              addToSidebarItems(n, n, _defaultitem);
            } else {
              Console.error(
                `No source was found for ${
                  x.name
                }! ${ReferenceDocDocsConfigurationPath(
                  "ApiReference.sidebarConfiguration.categorize"
                )} using "dir-${dir_level}" could not resolve the source file for the declaration.`
              );
            }
            return;
          }
          // if(SidebarCategorizeType === "dir-1")
          Console.error(
            `Unknown ${ReferenceDocDocsConfigurationPath(
              "ApiReference.sidebarConfiguration.categorize"
            )} category: ${SidebarCategorizeType}`
          );
        }
      });
    }
    _(reflections.Modules, "module");
    _(reflections.Classes, "class");
    _(reflections.Functions, "function");
    _(reflections.Interfaces, "interface");
    _(reflections.Types, "type");
    for (const x in SidebarItems) {
      (sidebar as any)["/api/"].push(SidebarItems[x]); //eslint-disable-line @typescript-eslint/no-explicit-any
    }
  }

  config.themeConfig.sidebar = sidebar;
  WriteViteUserConfig(directory, config);
  return true;
}

/**
 * @returns true if the value was set.
 */
export function AddNavLinkToViteUserConfig(
  directory: string,
  link: DefaultTheme.NavItem | DefaultTheme.NavItem[]
): boolean {
  const config = ReadViteProxyUserConfig(directory);
  if (config === undefined) {
    Console.warn(
      `Could not add link because no config was found. "${directory}"`
    );
    return false;
  }
  config.themeConfig = config.themeConfig ?? {};
  config.themeConfig.nav = config.themeConfig.nav ?? [];

  // remove any navs with the same link text.
  const nav = (config.themeConfig.nav as DefaultTheme.NavItem[]).filter((x) => {
    if (Array.isArray(link)) {
      const find = link.find((v) => v.text === x.text);
      return find ? undefined : x;
    } else {
      if (x.text === link.text) {
        return undefined;
      }
      return x;
    }
  });

  if (Array.isArray(link)) {
    link.forEach((x) => nav.push(x));
  } else {
    nav.push(link);
  }

  config.themeConfig.nav = nav;
  WriteViteUserConfig(directory, config);
  return true;
}

/**
 * @returns true if the value was removed.
 */
export function RemoveNavLinkToViteUserConfig(
  directory: string,
  link: string | string[]
): boolean {
  const config = ReadViteProxyUserConfig(directory);
  if (config === undefined) {
    return false;
  }
  config.themeConfig = config.themeConfig ?? {};
  config.themeConfig.nav = config.themeConfig.nav ?? [];

  // remove any navs with the same link text.
  const nav = (config.themeConfig.nav as DefaultTheme.NavItem[]).filter((x) => {
    if (Array.isArray(link)) {
      return link.find((v) => v === x.text);
    } else {
      if (x.text === link) {
        return x;
      }
    }
  });

  config.themeConfig.nav = nav;
  WriteViteUserConfig(directory, config);
  return true;
}

/**
 * Read config file from `<root>/.vitepress/config.[ext]`. as an object
 */
export function ReadViteUserConfig(directory: string): Promise<UserConfig> {
  const p = GetViteProxyUserConfigPathForDirectory(directory);
  if (!fs.existsSync(p)) {
    const DDC = GetDocDocsConfig();
    WriteViteUserConfig(directory, DDC.ViteUserConfig);
  }
  const r = fs.readFileSync(p, "utf8");
  return JSON.parse(r);
}

/**
 * Writes the user config from the docdocs config no matter if it existed before.
 */
export function CompileViteUserConfig(directory: string): UserConfig {
  const DDC = GetDocDocsConfig();
  const cwd = process.cwd();

  const UserSpecifiedViteSettingsFolder = path.join(cwd, ".vitepress");
  if (fs.existsSync(UserSpecifiedViteSettingsFolder)) {
    console.log(cwd);
  }

  // default values added to vite-userconfig
  // const themeConfig = DDC.ViteUserConfig.themeConfig ?? {};
  // const DefaultSocialLinks = [
  //   { icon: "github", link: "https://github.com/vuejs/vitepress" },
  // ];
  // themeConfig.socialLinks = themeConfig.socialLinks
  //   ? [...DefaultSocialLinks, ...themeConfig.socialLinks]
  //   : DefaultSocialLinks;

  // const getPackageLicenseText = (): string => {
  //   try {
  //     const p = JSON.parse(
  //       fs.readFileSync(path.join(process.cwd(), "package.json"), "utf-8")
  //     );
  //     if (p.license) {
  //       return `Released under the ${p.license} license.`;
  //     }
  //     throw "No License Field.";
  //   } catch (err) {
  //     Console.warn(`Could not resolve license: ${err}`);
  //   }
  //   return "";
  // };

  // const andGeneratedByText = `Documentation generated with ❤ by <a target="_blank" href="#">DocDocs</a> from <a target="_blank" href="#">@mekstuff</a>`;
  // if (!themeConfig.footer) {
  //   themeConfig.footer = {
  //     message: getPackageLicenseText(),
  //     copyright: andGeneratedByText,
  //   };
  // } else {
  //   themeConfig.footer.message =
  //     themeConfig.footer.message ?? getPackageLicenseText();
  //   const oldcopyright = themeConfig.footer.copyright;
  //   if (
  //     oldcopyright === undefined ||
  //     oldcopyright.match(andGeneratedByText) === -1
  //   ) {
  //     themeConfig.footer.copyright = themeConfig.footer.copyright
  //       ? themeConfig.footer.copyright + `<br/>${andGeneratedByText}`
  //       : andGeneratedByText;
  //   }
  // }

  // DDC.ViteUserConfig.themeConfig = themeConfig;

  WriteViteUserConfig(directory, DDC.ViteUserConfig);

  // Adding versions
  if (DDC.DocumentationVersions) {
    AddNavLinkToViteUserConfig(directory, {
      text: DDC.DocumentationVersions.current,
      items: DDC.DocumentationVersions.previous.map((x) => {
        return { text: x.text, link: x.link ?? `/${x.text}` };
      }),
    });
  }

  return DDC.ViteUserConfig;
}
