import fs from "fs";
import { Console } from "@mekstuff/logreport";
import { program as CommanderProgrammer } from "commander";
import { GetDocDocsRootCacheDirectory } from "../utils/core.js";

export default function CacheCommand(program: typeof CommanderProgrammer) {
  const cacheCommand = program.command("cache");

  cacheCommand
    .command("ls")
    .alias("list")
    .action(() => {
      Console.log(GetDocDocsRootCacheDirectory());
    });
  cacheCommand.command("clear").action(() => {
    const dir = GetDocDocsRootCacheDirectory();
    Console.info("Clearing cache...");
    fs.rmSync(dir, { recursive: true, force: true });
    Console.log(
      `Verify "${GetDocDocsRootCacheDirectory()}" no longer exists or is empty.`
    );
  });
}
