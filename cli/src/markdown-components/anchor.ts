export function anchor(
  body?: unknown,
  href?: string,
  target?: "_blank"
): string {
  return `<a ${target ? `target=${target}` : ""} ${
    href ? `href=${href}` : ""
  }>${body}</a>`;
}
