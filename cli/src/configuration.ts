import TypeDoc from "typedoc";
import { UserConfig } from "vitepress";

export interface DocDocsConfiguration {
  /**
   * Path of `tsconfig.json` file relative to the current working directory.
   */
  tsconfig: string;

  /**
   * Configure TypeDoc options, learn more [https://typedoc.org/api/interfaces/Configuration.TypeDocOptions.html](https://typedoc.org/api/interfaces/Configuration.TypeDocOptions.html)
   *
   * Do not edit unless you're certain what you're changing.
   */
  TypeDocOptions: Partial<TypeDoc.Configuration.TypeDocOptions>;

  /**
   * Learn more [https://vitepress.dev/reference/site-config](https://vitepress.dev/reference/site-config)
   */
  ViteUserConfig: UserConfig;

  // DocDocs Configuration
  /**
   * Configure and customize the `.vitepress/theme.index.js` file that is automatically generated.
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
    import?: (string | { p: string; from: string; default?: boolean })[];
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
  };

  /**
   * Learn more from the enhanceApp function exported.
   * @example
   * import { Config, enhanceApp } from "@mekstuff/docdocs";
   *
   * Config({
   * ...
   * enhanceApp({...})
   * })
   */
  // enhanceApp?: enhancedDocDocsVitePressApplication;

  // ViteTheme?: string | string[];

  /**
   * Creates a `dropdown` navigation showing the current version and links the the previous versions.
   *
   * For older versions, inside your `docs/` (or custom docs directory), you will place the compiled older version
   * into a dedicated folder, if you're version as "v1", "v2", etc... You will create a new folder called `v1` and place
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
    NoApiReference?: boolean;
    /**
     * The text of the navigation link for api
     *
     * defaults to `Api Reference`
     */
    NavigationLinkText?: string;

    /**
     * Configure the sidebar for /api/ route
     */
    SidebarConfiguration: {
      /**
       * How the api sidebar will be categorized
       *
       * Hybrid:
       * default - Categorizes by the type, e.g, Classes/Functions/Interfaces...
       * tag - Categorizes by the `@ddapi` tag of the reflection.
       */
      Categorize: "hybrid";
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
    contentBlock?: {
      type: "info" | "tip" | "warning" | "danger";
      title?: string;
      content: unknown;
    };
  }[];
  /**
   * The path of your doc entries
   */
  DocsEntry: string;
  /**
   * The output path where building docs will be created.
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
}

export const DefaultConfiguration: DocDocsConfiguration = {
  // external and third parties
  tsconfig: "./tsconfig.json",
  TypeDocOptions: {
    entryPoints: ["src/**"],
  },
  ViteUserConfig: {
    title: "DocsDocs Website",
    themeConfig: {
      search: {
        provider: "local",
      },
    },
  },
  // internal
  LinkToReflectionSource: true,
  ApiReference: {
    NoApiReference: false,
    NavigationLinkText: "Api Reference",
    SidebarConfiguration: {
      Categorize: "hybrid",
    },
  },
  CommentTagBadges: [
    {
      tag: "@readonly",
      emoji: "📖",
    },
    { tag: "@private", emoji: "🔒" },
    { tag: "@secured", emoji: "🔐" },
    { tag: "@server", emoji: "🖥️" },
    { tag: "@client", emoji: "💻" },
    {
      tag: "@async",
      emoji: "⚠️",
      contentBlock: {
        type: "warning",
        title: "⚠️ Asynchronous",
        content: "",
      },
    },
    { tag: "@yields", emoji: "✋" },
    { tag: "@deprecated", emoji: "⚠️" },
    { tag: "@const", emoji: "❗" },
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
        title: "Sponsors Only",
        details:
          "There will always be a free open-source version of docdocs that is more than sufficient for documenting your packages, But for more added features and customizability, have a look at our sponsors only version ❤️",
        link: "https://github.com/mekstuff/docdocs/sponsor",
        linkText: "Become a sponsor",
      },
    ],
  },
};
