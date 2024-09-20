/**
 * Typed with ❤️ @ mekstuff
 */

export const UNICODE_WARNING_SYMBOL = "⚠";
export const UNICODE_OPEN_IN_NEW_WINDOW_SYMBOL = "🡕";
export const INHERITANCE_EMOJI = "🧬";

export const SUPPORTED_BIN_PACKAGEMANAGERS = ["yarn", "npm", "pnpm", "bun"];

export const _use_pm_option = [
  `--use-pm <${SUPPORTED_BIN_PACKAGEMANAGERS.join("|")}>`,
  "Set the package manager that will be used to install packages/run any binaries",
];

export type _bin_exec = { add: string; remove: string; bin: string };

export const SUPPORTED_BIN_PACKAGEMANAGERS_bin_exec: Record<string, _bin_exec> =
  {
    ["yarn"]: {
      add: "yarn add",
      remove: "yarn remove",
      bin: "yarn",
    },
    ["npm"]: {
      add: "npm install",
      remove: "npm remove",
      bin: "npm",
    },
    ["pnpm"]: {
      add: "pnpm install",
      remove: "pnpm remove",
      bin: "pnpm",
    },
    ["bun"]: {
      add: "bun install",
      remove: "bun remove",
      bin: "bun",
    },
  };

export const SUPPORTED_BIN_PACKAGEMANAGERS_LOCKFILES: Record<string, string> = {
  yarn: "yarn.lock",
  npm: "package-lock.json",
  pnpm: "pnpm-lock.yaml",
  bun: "bun.lockb",
};
