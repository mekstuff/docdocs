import { page } from "./page.js";
/**
  Markdown Components
 */
export function linebreak(total?: number): string {
  total = total ?? 2;
  return "\n".repeat(total);
}

/**
  Markdown Components
 */
export function linebreakWithDashes(lineBreakTotal?: number): string {
  const t = lineBreakTotal ? lineBreakTotal / 2 : undefined;
  return page([linebreak(t), "---", linebreak(t)]);
}
