import fs from "fs";
import path from "path";
import { GetDocDocsConfig } from "./core.js";

/**
 * Definition of `tsdoc.json` file.
 */
export interface TsDocConfig {
  extends: string[];
  tagDefinitions: {
    tagName: string;
    synatxKind: "block" | "modifier" | "inline";
  }[];
}

/**
 * Gets the `tsdoc.json` file path from the directory, creates it if it doesn't exist.
 */
export function GetTsDocConfigPath(directory: string): string {
  const dir = path.join(directory, "tsdoc.json");
  if (!fs.existsSync(dir)) {
    fs.writeFileSync(
      dir,
      JSON.stringify(
        {
          extends: ["typedoc/tsdoc.json"],
        },
        undefined,
        2
      )
    );
  }
  return dir;
}

/**
 * Reads the `tsdoc.json` file.
 */
export function ReadTsDocConfig(directory: string): TsDocConfig {
  return JSON.parse(
    fs.readFileSync(GetTsDocConfigPath(directory), "utf-8")
  ) as TsDocConfig;
}

/**
 * Writes to the `tsdoc.json` file.
 */
export function WriteTsDocConfig(directory: string, data: TsDocConfig) {
  // TODO:Do not write if the data is the same.
  fs.writeFileSync(
    GetTsDocConfigPath(directory),
    JSON.stringify(data, undefined, 2),
    "utf-8"
  );
}

/**
 * Sets the tag definitions to the `tsdoc.json` file.
 */
export function SetTsDocConfigTagDefinitions(
  directory: string,
  TagDefinitions: TsDocConfig["tagDefinitions"]
) {
  const c = ReadTsDocConfig(directory);
  c.tagDefinitions = TagDefinitions;
  WriteTsDocConfig(directory, c);
}

/***/
export function InitializeTsDocConfig(directory: string) {
  const DDC = GetDocDocsConfig();
  console.log("initialize-tsdoc-config");
}
