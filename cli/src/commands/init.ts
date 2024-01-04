import fs from "fs";
import { Console } from "@mekstuff/logreport";
import { program as CommanderProgrammer } from "commander";
import { GetDocDocsConfigDir } from "../utils/core.js";

/**
  Commands
 */
export default function InitCommand(program: typeof CommanderProgrammer) {
  program.command("init").action(() => {
    if (fs.existsSync(GetDocDocsConfigDir())) {
      Console.error("A configuration file already exists.");
    }
    fs.writeFileSync(
      GetDocDocsConfigDir(),
      DefaultDocDocsConfigTemplate,
      "utf-8"
    );
  });
}

const DefaultDocDocsConfigTemplate = `// https://mekstuff.github.io/docdocs/configuration
import { Config } from "@mekstuff/docdocs";

// prettier-ignore
export default Config({
    // tsconfig: string;
    // ViteUserConfig: UserConfig;
    // ...
})
`;
