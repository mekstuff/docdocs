// https://mekstuff.github.io/docdocs/configuration
import { Config } from "@mekstuff/docdocs";
// prettier-ignore
export default Config({
    DocumentationVersions: {
        current: "1.0.0",
        previous: [
            {text: "0.0.5", link: "/0.0.5"}
        ]
    },
    ViteUserConfig: {
        themeConfig: {
            footer: {
                message: "Hello",
                copyright: "WTF",
            }
        }
    }
    // tsconfig: string;
    // ViteUserConfig: UserConfig;
    // ...
})
