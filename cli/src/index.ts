#!/usr/bin/env node

import ServeCommand from "./commands/serve.js";
import BuildCommand from "./commands/build.js";
import CacheCommand from "./commands/cache.js";
import InitCommand from "./commands/init.js";

import { Command } from "commander";
import {
  DocDocsConfiguration,
  DefaultConfiguration,
  ReferenceDocDocsConfigurationPath,
} from "./configuration.js";
import PreviewCommand from "./commands/preview.js";
import { Console } from "@mekstuff/logreport";

const program = new Command();

ServeCommand(program);
BuildCommand(program);
PreviewCommand(program);
CacheCommand(program);
InitCommand(program);

program.parse();

// configurations.

/**
 *
 * To define configuration for docdocs, create a `docdocs.config.ts` file in root directory.
 * ```ts
 * import { Config } from "@mekstuff/docdocs";
 *
 * export default Config({
 * ...
 * )}
 * ```
 */
export function Config(
  configuration: Partial<DocDocsConfiguration>
): DocDocsConfiguration {
  return { ...DefaultConfiguration, ...configuration };
}

/**
 * For getting the default values of the `DocDocsConfiguration`.
 *
 * Use within your `Config` definition to set default values. It is recommended to use this within every object configuration you change as some configurations
 * are required.
 *
 * e.g. if you wish to keep the default HomePage but only change the name:
 * ```ts
 * export default Config({
 *  HomePageConfiguration: {
 *    ...GetDefaultConfigValue("HomePageConfiguration"),
 *    name: "Heading",
 *  }
 * });
 * ```
 */
export function GetDefaultConfigValue(
  Path: Parameters<typeof ReferenceDocDocsConfigurationPath>[0]
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
): any {
  let _p = DefaultConfiguration as any; //eslint-disable-line @typescript-eslint/no-explicit-any
  const paths = Path.split(".");
  paths.forEach((p) => {
    try {
      _p = _p[p];
      if (_p === undefined) {
        throw "The value is undefined";
      }
    } catch (err) {
      Console.error(
        `Something went wrong when using "GetDefaultConfigValue". The path "${Path}" failed at index "${p}" because: ${err}.`
      );
    }
  });
  return _p;
}
