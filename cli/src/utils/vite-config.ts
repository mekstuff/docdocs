import fs from "fs";
import path from "path";
import TypeDoc from "typedoc";
import { UserConfig, DefaultTheme } from "vitepress";
import { GetDocDocsConfig, SupportedApiRoutes } from "./core.js";
import { Console } from "@mekstuff/logreport";
import pluralize from "pluralize";

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
  const stringed = JSON.stringify(config, undefined, 2);
  ExpectsVitePressDirectory(directory);
  fs.writeFileSync(
    GetViteProxyUserConfigPathForDirectory(directory),
    stringed,
    "utf-8"
  );
  const c = `/* Generated with ❤ By DocsDocs from @mekstuff */\nexport default ${stringed}`;
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
 * @returns adds the api to the sidebar
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
      `You cannot use an array for sidebar while having api references. Use a dictionary instead\n\nlearn more: https://vitepress.dev/reference/default-theme-sidebar#multiple-sidebars`
    );
  } else {
    sidebar["/api/"] = [];
    const SidebarCategorizeType =
      DDConfig.ApiReference.SidebarConfiguration.Categorize;

    // hybrid api sidebar
    if (SidebarCategorizeType === "hybrid") {
      const SidebarItems: Record<string, DefaultTheme.SidebarItem> = {};
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
            let tagName: string;
            const ddapiBlockTag = x.comment?.blockTags.find(
              (x) => x.tag === "@ddapi"
            );
            if (ddapiBlockTag === undefined) {
              tagName = pluralize(route);
            } else {
              tagName = ddapiBlockTag.content[0]?.text ?? pluralize(route);
            }
            const item: DefaultTheme.SidebarItem = {
              text: x.name,
              link: `api/${route}/${path.parse(x.name).name.toLowerCase()}`,
            };
            if (SidebarItems[tagName]) {
              SidebarItems[tagName].items?.push(item);
            } else {
              SidebarItems[tagName] = {
                text: tagName.charAt(0).toUpperCase() + tagName.slice(1),
                collapsed: true,
                items: [item],
              };
            }
          } else {
            Console.error(
              `Declaration reflection expected for Sidebar item when using "tag" categorization.`
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
        (sidebar as any)["/api/"].push(SidebarItems[x]);
      }
    }
    //   // default sidebar
    //   if (SidebarCategorizeType === "default") {
    //     function AddToSidebar(
    //       targetReflections: TypeDoc.Models.Reflection[],
    //       name: keyof typeof reflections,
    //       route: SupportedApiRoutes
    //     ) {
    //       if (targetReflections.length > 0) {
    //         const c: DefaultTheme.SidebarItem = {
    //           text: name,
    //           items: [],
    //           collapsed: true,
    //         };
    //         targetReflections.forEach((x) => {
    //           c.items?.push({
    //             text: x.name,
    //             link: `api/${route}/${x.name.toLowerCase()}`,
    //           });
    //         });
    //         /* eslint-disable @typescript-eslint/no-explicit-any */
    //         (sidebar as any)["/api/"].push(c);
    //       }
    //     }
    //     AddToSidebar(reflections.Classes, "Classes", "class");
    //     AddToSidebar(reflections.Functions, "Functions", "function");
    //     AddToSidebar(reflections.Interfaces, "Interfaces", "interface");
    //     AddToSidebar(reflections.Types, "Types", "type");
    //   }
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
