import TypeDoc from "typedoc";

/**
 * Makrdown of flag reflections
 */
export default function CommentNode(comment: TypeDoc.Models.Comment): string {
  return `${comment.summary.map((x) => x.text).join("\n")}`;
}
