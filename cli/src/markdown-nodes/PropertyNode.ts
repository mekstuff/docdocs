import TypeDoc from "typedoc";
import CommentNode from "./CommentNode.js";
import FlagsNode from "./FlagsNode.js";
import TypeNode from "./TypeNode.js";
import InheritedFromNode from "./InheritedFromNode.js";
import { SourceLinkDefinedInNode } from "./SourceLinkNode.js";

/**
 * Markdown of a class reflection.
 */
export default function PropertyNode(
  reflection: TypeDoc.Models.DeclarationReflection
): string {
  return `### ${reflection.name} ${
    reflection.flags ? FlagsNode(reflection.flags, reflection.comment) : ""
  }

:::tip ${reflection.parent?.name + "." + reflection.name}: ${
    reflection.type ? TypeNode(reflection.type) : "UNRESOLVED TYPE"
  } 

  ${reflection.defaultValue ? `( Defaults to ${reflection.defaultValue} )` : ""}
  ${reflection.inheritedFrom ? InheritedFromNode(reflection.inheritedFrom) : ""}
  :::

${reflection.comment ? CommentNode(reflection.comment) : ""}

${SourceLinkDefinedInNode(reflection)}
`;
}
