// https://mekstuff.github.io/docdocs/configuration
import { Config, GetDefaultConfigValue } from "@mekstuff/docdocs";

// prettier-ignore
export default Config({
    ViteUserConfig: {
        ...GetDefaultConfigValue("ViteUserConfig"),
        themeConfig: {
            nav: [
                { text: "Guide", link: "/GettingStarted/hello"},
              ],
            //   sidebar: `$!{ generateSidebar([
            //     {
            //         documentRootPath: '/',
            //         resolvePath: '/',
            //         useTitleFromFileHeading: true,
            //         excludeFolders: ['api', 'node_modules']
            //     },
            //     {
            //         documentRootPath: 'api',
            //         resolvePath: '/api/',
            //         useTitleFromFrontmatter: true,
            //     }
            //   ]) }!`
        }
    },
    ApiReference: {
        ...GetDefaultConfigValue("ApiReference"),
        // noApiSidebar: true,
    },
    ViteTheme: {
        // packages: ["vitepress-sidebar"],
        // config_import: [{p: "generateSidebar", from: "vitepress-sidebar", default: false}]
    }
})
