import TypeDoc from "typedoc";
import CommentNode from "./CommentNode.js";
import PropertyNode from "./PropertyNode.js";
import { page } from "../markdown-components/page.js";
import { h1 } from "../markdown-components/heading.js";
import {
  linebreak,
  linebreakWithDashes,
} from "../markdown-components/linebreak.js";

/**
 * Markdown of a function reflection.
 */
export default function InterfaceNode(
  reflection: TypeDoc.Models.DeclarationReflection
): string {
  return page(
    [h1(reflection.name)],
    reflection.comment ? [CommentNode(reflection.comment)] : [],
    [linebreakWithDashes()],
    reflection.children
      ? [
          reflection.children
            .map((child) => (child.type ? PropertyNode(child) : ""))
            .join(linebreak(3)),
        ]
      : []
  );
}
