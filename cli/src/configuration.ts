import TypeDoc from "typedoc";
import { UserConfig } from "vitepress";
import { SupportedApiRoutes } from "./utils/core.js";

/**
 *
 */
export type package_import_statemnets = (
  | string
  | { p: string; from: string; default?: boolean }
)[];
export interface DocDocsConfiguration {
  /**
   * Configure TypeDoc options, learn more [https://typedoc.org/api/interfaces/Configuration.TypeDocOptions.html](https://typedoc.org/api/interfaces/Configuration.TypeDocOptions.html)
   *
   * Do not edit unless you're certain what you're changing.
   *
   * The entryPoints default to `["src/**"]`
   */
  TypeDocOptions: Partial<TypeDoc.Configuration.TypeDocOptions>;

  /**
   * Learn more [https://vitepress.dev/reference/site-config](https://vitepress.dev/reference/site-config)
   *
   * Defaults with a title and a local search provider
   */
  ViteUserConfig: UserConfig;

  // DocDocs Configuration
  /**
   * Setup how links for external reference types are resolved.
   *
   * By default, there's support for roblox-ts "compiler-types" and "types".
   */
  TypeNodeReferenceTypeLinkResolver: Record<
    string,
    /**
     * @returns The url.
     */
    (type: {
      /**
       * The name of the package where the Reference is from
       * e.g. `@rbxts/types`
       */
      package: string;
      /**
       * The name fo the type.
       */
      name: string;
      /**
       * The `file` name of which the reference is from.
       */
      fileName: string;
    }) => string
  >;
  /**
   * If `true`, if a reflection has `example` tags, they will be listed inside of a collapsed codeblock at the end of
   * the node.
   */
  DisplayCodeBlockExamplesAtEndOfNode?: boolean;
  // /**
  //  * Configure the sidebar behaviour for your docs
  //  */
  // DocsSidebar: {
  //   /**
  //    * Automatically generate the sidebar.
  //    *
  //    * `dir` - generates sidebar based on the directory/file structure. ( default )
  //    *
  //    * `false` - does not automatically generate sidebar.
  //    *
  //    */
  //   automatic: "dir" | false;
  // };
  /**
   * Configure and customize the `.vitepress/theme.index.js` file that is automatically generated.
   * Also contains configuration for the `.vitepress/config.js` file for non json configurations.
   */
  ViteTheme?: {
    /**
     * A list of packages that will be installed.
     */
    packages?: string[];
    /**
     * A list packages that will be imported at the top of the file.
     * This should be used for importing styles and themes.
     */
    import?: package_import_statemnets;
    /**
     * Executable source that will be placed after imports and before export.
     */
    source?: string;
    /**
     * Executable sources that will be placed inside the default export of the theme.
     */
    export?: string[];
    /**
     * Executable source that will be placed at the bottom of the `enhanceApp` function, you have access to the `ctx` variable.
     */
    enhance?: string;
    /**
     * A list of packagtes that will be imported at the top of the `.vitepress/config.js` file
     */
    config_import?: package_import_statemnets;
  };

  /**
   * Creates a `dropdown` navigation showing the current version and links the the previous versions.
   *
   * For older versions, inside your `docs/` (or custom docs directory), you will place the compiled older version
   * into a dedicated folder, if you're versioning as "v1", "v2", etc... You will create a new folder called `v1` and place
   * old docs into that folder and create a new `previous` version with href "/v1".
   *
   * By default previous links `link` will be `/[text]`.
   */
  DocumentationVersions?: {
    current: string;
    previous: { text: string; link?: string }[];
  };
  /**
   * Includes a link to the source and line of which a reflection is defined.
   */
  LinkToReflectionSource?: boolean;
  /**
   * Configure Api Referencing.
   */
  ApiReference: {
    /**
     * Does not create any api reference, (Does not create documentation from your source code.)
     */
    noApiReference?: boolean;
    /**
     * Disables creating the sidebar, You may need to enable this when using packages that auto generate sidebars.
     */
    noApiSidebar?: boolean;
    /**
     * Excludes the type of declaration reflections from the sidebar.
     */
    exclude?: SupportedApiRoutes[];
    /**
     * The text of the navigation link for api
     *
     * defaults to `Api Reference`
     */
    navigationLinkText?: string;

    /**
     * Configure the sidebar for /api/ route
     */
    sidebarConfiguration: {
      /**
       * How the api sidebar will be categorized
       *
       * `sibling` - Sorts by the type of reflection, e.g. Class, Function, etc.
       *
       * `dir` - Sorts by the directory at which they're in. `dir-1` will sort by one directory up, `dir-2` by to levels up, etc. Use `dir-[number]` to specify a specific directory level.
       */
      categorize: "sibling" | "dir-1" | "dir-2" | "dir-3" | `dir-[${number}]`;
      /**
       * This function will be called forEach side bar configuration entry that is about to be added.
       *
       * @returns The string you return will be used as the "Category" in which the reflection will be placed.
       * If you return a string beginning with `$`. It will instead have the reflection use the categorize method that you specified.
       * e.g. $sibling will make it use the "sibling" category behaviour.
       * Returning `undefined` will have it proceed with normal categorize method.
       */
      forEach?: (reflection: {
        name: string;
        route: SupportedApiRoutes;
        ddapi: string | undefined;
        isDeprecated: boolean;
        sources: {
          fileName: string;
          fullFileName: string;
          /**
           * The `fullFileName` path relative to the current working directory.
           */
          relativePath: string;
          /**
           * The relative "directory"  of the "relativePath"
           */
          relativeDirectory: string;
        }[];
      }) =>
        | `$${DocDocsConfiguration["ApiReference"]["sidebarConfiguration"]["categorize"]}`
        | string
        | undefined;
    };
  };

  /**
   * Comment tags. for e.g `@readonly`
   *
   * For list of supported emojis, view https://github.com/markdown-it/markdown-it-emoji/blob/master/lib/data/full.json
   */
  CommentTagBadges: {
    tag: `@${string}`;
    /**
     * Emoji that will be shown for tag
     *
     * Sponsor only version is required for adding custom emojis to custom tags, tags like `@readonly` have there own tags
     * that do not require Sponsor.
     */
    emoji?: string;
    /**
     * if `true`, a badge will not be displayed inline. This can be used if you want to display a `contentBlock` but not
     * cloud the inline badges
     */
    noBadge?: boolean;
    /**
     * If the FlagNode has the tag, if you specify a contentBlock, it will be placed on the next line following the inline tags.
     */
    contentBlock?: {
      type: "info" | "tip" | "warning" | "danger";
      title?:
        | string
        | ((
            tag: TypeDoc.Models.CommentTag,
            tagContentAsString: string
          ) => string);
      /**
       * If the tag already has content, it will always use that content over this content UNLESS this is a function.
       */
      content?:
        | ((
            tag: TypeDoc.Models.CommentTag,
            tagContentAsString: string
          ) => NonNullable<unknown>)
        | symbol
        | string
        | object;
    };
  }[];
  /**
   * The path of your doc entries.
   *
   * defaults to `./docs`
   */
  DocsEntry: string;
  /**
   * The output path where building docs will be created.
   *
   * defaults to `./docs/dist`
   */
  DocsBuildOutput: string;
  /**
   * Configure the `home/landing` page
   *
   * Learn more [https://vitepress.dev/reference/default-theme-home-page](https://vitepress.dev/reference/default-theme-home-page)
   */
  HomePageConfiguration: {
    name?: string;
    text: string;
    tagline?: string;
    image?:
      | string
      | { src: string; alt?: string }
      | { light: string; dark: string };
    actions?: {
      theme?: "brand" | "alt";
      text: string;
      link: string;
    }[];
    features?: {
      icon?:
        | string
        | { src: string; alt?: string; width?: string; height: string }
        | {
            light: string;
            dark: string;
            alt?: string;
            width?: string;
            height: string;
          };
      title: string;
      details: string;
      link?: string;
      linkText?: string;
      rel?: string;
    }[];
  };
  /**
   * Quickly setup a team page to display and credit your team members.
   */
  TeamPageConfiguration?: {
    /**
     * List of your team members.
     */
    teamMembers: {
      avatar?: string;
      name?: string;
      title?: string;
      links?: { icon?: string; link: string }[];
    }[];
    /**
     * The heading that will be at the top of the team page.
     *
     * defaults to `Our Team`
     */
    teamPageHeader?: string;
    /**
     * The text that will be below the heading of the team page.
     *
     * defaults to `_`
     */
    teamPageLead?: string;
    /**
     * The `Route` url of the team page.
     *
     * defaults to `./team.md`
     */
    teamPageRoute?: string;
  };
}

export const DefaultConfiguration: DocDocsConfiguration = {
  // external and third parties
  TypeDocOptions: {
    entryPoints: ["src/**"],
  },
  ViteUserConfig: {
    title: "DocDocs Website",
    themeConfig: {
      search: {
        provider: "local",
      },
    },
  },
  // internal
  TypeNodeReferenceTypeLinkResolver: {
    "@rbxts/types": (type) => {
      console.log(type);
      return "https://roblox.com";
    },
    "@rbxts/compiler-types": (type) => {
      if (type.name === "Promise") {
        return "https://www.eryn.io/roblox-lua-promise";
      }
      return "https://roblox-ts.com";
    },
  },
  DisplayCodeBlockExamplesAtEndOfNode: true,
  // DocsSidebar: {
  //   automatic: "dir",
  // },
  ViteTheme: undefined,
  DocumentationVersions: undefined,
  LinkToReflectionSource: true,
  ApiReference: {
    noApiReference: false,
    exclude: undefined,
    navigationLinkText: "Api Reference",
    sidebarConfiguration: {
      categorize: "sibling",
      forEach: undefined,
    },
  },
  CommentTagBadges: [
    { tag: "@readonly", emoji: "📖" },
    { tag: "@private", emoji: "🔒" },
    { tag: "@secured", emoji: "🔐" },
    {
      tag: "@async",
      emoji: "⚠️",
      contentBlock: {
        type: "warning",
        title: "⚠️ Asynchronous",
        content: "",
      },
    },
    {
      tag: "@deprecated",
      emoji: "⚠️",
      contentBlock: {
        type: "danger",
        title: "⚠️ Deprecated",
        content:
          "This feature is deprecated and should not be used in new work.",
      },
    },
    {
      tag: "@since",
      emoji: "",
      noBadge: true,
      contentBlock: {
        type: "warning",
        title: (_, content) => {
          if (!content) {
            return "You need to specify @since [when] if you're using the default @since tag! e.g. @since 1.2.0";
          }
          return `This feature is available only in version ${content} or higher.`;
        },
      },
    },
  ],
  DocsEntry: "./docs",
  DocsBuildOutput: "./docs/dist",
  HomePageConfiguration: {
    name: "DocDocs",
    text: "Build websites from your source code.",
    tagline:
      "Simple, powerful, and fast. Meet the modern SSG framework you've always wanted.",
    actions: [
      { text: "Get Started", link: "/getting-started", theme: "brand" },
      {
        text: "View on Github",
        link: "https://github.com/mekstuff/docdocs",
        theme: "alt",
      },
    ],
    features: [
      {
        icon: "🚀",
        title: "Super Fast",
        details:
          "DocDocs builds out static websites using vitepress, which is built upon the lightning fast vue & vite frameworks.",
        link: "https://vitepress.dev/",
        linkText: "More about Vitepress",
      },
      {
        icon: "⚙️",
        title: "Customize Your Homepage",
        details:
          "You can customize your home page by configuring the `HomePageConfiguration` in your `docdocs.config.[ext]` file.",
        link: "https://vitepress.dev/reference/default-theme-home-page",
        linkText: "Learn More",
      },
      {
        icon: "❤️",
        title: "Support DocDocs",
        details:
          "DocDocs is an open source project, You can support it by making contributions to the development or through donations of any amount! Using DocDocs in itself is already a form of support so we thank you ❤️",
        link: "https://github.com/mekstuff/docdocs",
        linkText: "Contribute to DocDocs",
      },
    ],
  },
  TeamPageConfiguration: undefined,
};

type PathImpl<T, K extends keyof T> = K extends string
  ? T[K] extends Record<string, unknown>
    ? T[K] extends ArrayLike<unknown>
      ? K | `${K}.${PathImpl<T[K], Exclude<keyof T[K], keyof unknown[]>>}`
      : K | `${K}.${PathImpl<T[K], keyof T[K]>}`
    : K
  : never;

type Path<T> = PathImpl<T, keyof T> | keyof T;

/**
 * type safely reference a configuration path during runtime.
 */
export function ReferenceDocDocsConfigurationPath(
  path:
    | Path<
        Omit<
          DocDocsConfiguration,
          "ViteUserConfig" | "TypeDocOptions" | "tsconfig"
        >
      >
    | "ViteUserConfig"
    | "TypeDocOptions"
    | "tsconfig"
): string {
  return `"docdocs.config.[ext].${path}"`;
}
