import TypeDoc from "typedoc";
import SignatureNode, {
  GithubStyledSignatureParameters,
} from "./SignatureNode.js";
import CommentNode from "./CommentNode.js";
import InheritedFromNode from "./InheritedFromNode.js";
import { SourceLinkDefinedInNode } from "./SourceLinkNode.js";

/**
 * Markdown of a class reflection.
 */
export default function MethodNode(
  reflection: TypeDoc.Models.DeclarationReflection
): string {
  return `### ${reflection.name}

  ${reflection.signatures
    ?.map(
      (x) => `:::tip ${reflection.parent?.name + "." + reflection.name}

${SignatureNode(x)}

${reflection.inheritedFrom ? InheritedFromNode(reflection.inheritedFrom) : ""}
:::

${GithubStyledSignatureParameters(x)}

${x.comment ? CommentNode(x.comment) : ""}


`
    )
    .join("\n")}

${SourceLinkDefinedInNode(reflection)}
`;
}
