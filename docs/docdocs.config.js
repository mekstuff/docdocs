// https://mekstuff.github.io/docdocs/configuration
import { Config, GetDefaultConfigValue } from "@mekstuff/docdocs";

// prettier-ignore
export default Config({
    ViteUserConfig: {
        ...GetDefaultConfigValue("ViteUserConfig"),
        themeConfig: {
            swag: {},
            nav: [
                {
                    text: "Home",
                    link: "/",
                },
                {
                    text: "Guide",
                    link: "/guide/introduction/what-is-docdocs",
                    activeMatch: "/guide/"
                }
            ],
            sidebar: `$!{ generateSidebar([
                {
                    documentRootPath: 'guide',
                    resolvePath: '/guide/',
                    useTitleFromFileHeading: true,
                    collapsed: true,
                  },
                  {
                    documentRootPath: 'api',
                    resolvePath: '/api/',
                    useTitleFromFrontmatter: true,
                  }
              ]) }!`
        }
    },
    ViteTheme: {
        packages: ["vitepress-sidebar", "vitepress-shopware-docs"],
        config_import: [
            {p: "generateSidebar", from: "vitepress-sidebar"},
            {p: "baseConfig", from: "vitepress-shopware-docs/config", default: true}
        ],
        import: [{p: "SWAGTheme", from: "vitepress-shopware-docs"}],
        export: ["...SWAGTheme()"]
    },
    TypeDocOptions: {
        ...GetDefaultConfigValue("TypeDocOptions"),
        tsconfig: "../cli/tsconfig.json",
        entryPoints: ["../cli/src/**"],
        entryPointStrategy: "expand"
    },
    ApiReference: {
        ...GetDefaultConfigValue("ApiReference"),
        navigationLinkText: "CLI Reference",
        noApiSidebar: true,
    }
})
