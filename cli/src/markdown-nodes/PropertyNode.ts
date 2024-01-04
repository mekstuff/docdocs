import TypeDoc from "typedoc";
import CommentNode from "./CommentNode.js";
import FlagsNode from "./FlagsNode.js";
import TypeNode from "./TypeNode.js";
import InheritedFromNode from "./InheritedFromNode.js";
import { SourceLinkDefinedInNode } from "./SourceLinkNode.js";
import { page } from "../markdown-components/page.js";
import { h3 } from "../markdown-components/heading.js";
import { admonition } from "../markdown-components/admonition.js";
import ExampleBlockNode from "./ExampleBlockNode.js";

/**
 * Markdown of a class reflection.
 */
export default function PropertyNode(
  reflection: TypeDoc.Models.DeclarationReflection
): string {
  const IsOptional =
    (reflection.flags.find((x) => x === "Optional") && true) || false;

  return page(
    [h3(reflection.name + (IsOptional ? "?" : "")), FlagsNode(reflection)],
    [
      admonition(
        page(
          reflection.defaultValue
            ? [`( Defaults to ${reflection.defaultValue} )`]
            : [],
          reflection.inheritedFrom
            ? [InheritedFromNode(reflection.inheritedFrom)]
            : []
        ),
        "tip",
        reflection.parent?.name +
          "." +
          reflection.name +
          `${IsOptional ? "?" : ""}: ` +
          (reflection.type
            ? TypeNode(reflection.type, undefined, true)
            : "UNRESOLVED TYPE")
      ),
    ],
    reflection.comment ? [CommentNode(reflection.comment)] : [],
    [ExampleBlockNode(reflection.comment)],
    [SourceLinkDefinedInNode(reflection)]
  );
}
