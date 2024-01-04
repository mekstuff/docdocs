/**
  Markdown Components
 */
export function admonition(
  body?: unknown,
  type?: string,
  heading?: string
): string {
  return `::: ${type ?? ""} ${heading ?? ""}\n${body ?? ""}\n:::`;
}
