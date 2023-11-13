#!/usr/bin/env node

import ServeCommand from "./commands/serve.js";
import BuildCommand from "./commands/build.js";
import CacheCommand from "./commands/cache.js";
import InitCommand from "./commands/init.js";

import { Command } from "commander";
import { DocDocsConfiguration, DefaultConfiguration } from "./configuration.js";

const program = new Command();

ServeCommand(program);
BuildCommand(program);
CacheCommand(program);
InitCommand(program);

program.parse();

// configurations.

/**
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
  const config = { ...DefaultConfiguration, ...configuration };

  // TODO: Make a more optimized and better way to keep the default in nested objects.

  // Keep original comment tags
  config.CommentTagBadges = [
    ...DefaultConfiguration.CommentTagBadges,
    ...config.CommentTagBadges,
  ];

  config.ApiReference = {
    ...DefaultConfiguration.ApiReference,
    ...config.ApiReference,
  };
  return config;
}
