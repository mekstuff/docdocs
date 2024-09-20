import { linebreak } from "./linebreak.js";

export function page(...md: string[][]): string {
  return md.map((x) => x.join(" ")).join(linebreak());
}
