/**
 * Typed with ❤️ @ mekstuff
 */

import fs from "fs";
import path from "path";
import { Console } from "@mekstuff/logreport";
import {
  SUPPORTED_BIN_PACKAGEMANAGERS,
  SUPPORTED_BIN_PACKAGEMANAGERS_LOCKFILES,
  SUPPORTED_BIN_PACKAGEMANAGERS_bin_exec,
  _bin_exec,
} from "../CONSTANTS.js";
import { argv } from "process";

/**
 * Gets package manager to execute bin files
 */
export function GetPreferredBinExecuteablePM(cwd?: string): _bin_exec {
  let _exec: _bin_exec | undefined;

  const usepmFlag = argv.indexOf("--use-pm");
  if (usepmFlag !== -1) {
    const usepmV = usepmFlag ? argv[usepmFlag + 1] : undefined;
    if (usepmV === undefined) {
      Console.error(
        `Could not resolve package manager specified by --use-pm flag.`
      );
    }
    const t = SUPPORTED_BIN_PACKAGEMANAGERS_bin_exec[usepmV as string];
    if (!t) {
      Console.error(
        'The package manager specified by the --use-pm flag is not supported: "' +
          usepmV +
          '". Try one of these instead: ' +
          SUPPORTED_BIN_PACKAGEMANAGERS.join(" | ")
      );
    }
    _exec = t;
  } else {
    for (const pm of SUPPORTED_BIN_PACKAGEMANAGERS) {
      const LFN = SUPPORTED_BIN_PACKAGEMANAGERS_LOCKFILES[pm];
      if (!LFN) {
        continue;
      }
      const lock_in_cwd = fs.existsSync(path.join(cwd ?? process.cwd(), LFN));
      if (lock_in_cwd) {
        _exec = SUPPORTED_BIN_PACKAGEMANAGERS_bin_exec[pm];
        break;
      }
    }
  }

  if (!_exec) {
    if (cwd !== process.cwd()) {
      // if not resolved in the define cwd, try the current working directory
      return GetPreferredBinExecuteablePM(process.cwd());
    }
    Console.error(
      "No package manager lock file found. Please specify a package manager with the --use-pm flag."
    );
  }

  return _exec as _bin_exec;
}
