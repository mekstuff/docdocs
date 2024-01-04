import TypeDoc from "typedoc";
import { page } from "../markdown-components/page.js";
import { linebreak } from "../markdown-components/linebreak.js";

/**
 * Makrdown of comment model.
 */
export default function CommentNode(comment: TypeDoc.Models.Comment): string {
  return page([comment.summary.map((x) => x.text).join("")]);
}

/**
 * Markdown of comment display part model.
 */
export function CommentTagContentDisplayPartNode(
  commentTag: TypeDoc.Models.CommentDisplayPart[]
): string {
  return page([commentTag.join(linebreak())]);
}
