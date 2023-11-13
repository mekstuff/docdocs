import TypeDoc from "typedoc";
import SignatureNode, {
  GithubStyledSignatureParameters,
} from "./SignatureNode.js";
import CommentNode from "./CommentNode.js";
import FlagsNode from "./FlagsNode.js";
import { SourceLinkDefinedInNode } from "./SourceLinkNode.js";

/**
 * Markdown of a function reflection.
 */
export default function FunctionNode(
  reflection: TypeDoc.Models.DeclarationReflection
): string {
  return `# ${reflection.name} ${
    reflection.flags ? FlagsNode(reflection.flags, reflection.comment) : ""
  }
${
  reflection.signatures
    ? reflection.signatures
        .map(
          (x) => `${SignatureNode(x)}

${GithubStyledSignatureParameters(x)}

${x.comment ? CommentNode(x.comment) : ""}

    `
        )
        .join("\n")
    : ""
}

${SourceLinkDefinedInNode(reflection)}  
  `;
}
