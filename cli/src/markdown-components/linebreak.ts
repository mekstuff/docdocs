import { page } from "./page.js";

export function linebreak(total?: number): string {
  total = total ?? 2;
  return "\n".repeat(total);
}

export function linebreakWithDashes(lineBreakTotal?: number): string {
  const t = lineBreakTotal ? lineBreakTotal / 2 : undefined;
  return page([linebreak(t), "---", linebreak(t)]);
}
