import TypeDoc from "typedoc";
import CommentNode from "./CommentNode.js";
import PropertyNode from "./PropertyNode.js";

/**
 * Markdown of a function reflection.
 */
export default function InterfaceNode(
  reflection: TypeDoc.Models.DeclarationReflection
): string {
  return `# ${reflection.name}
  ${reflection.comment ? CommentNode(reflection.comment) : ""}

---

  ${
    reflection.children
      ? reflection.children
          .map((x) => (x.type ? PropertyNode(x) : ""))
          .join("\n\n")
      : ""
  }
  `;
}
