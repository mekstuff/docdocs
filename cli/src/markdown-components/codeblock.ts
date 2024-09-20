export function codeblock(body?: unknown, lang?: string): string {
  return `\`\`\`${lang ?? ""}\n${body ?? ""}\n\`\`\``;
}
