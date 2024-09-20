export function sup(content: unknown, total?: number) {
  total = total ?? 1;
  return "<sup>".repeat(total) + content + "</sup>".repeat(total);
}
