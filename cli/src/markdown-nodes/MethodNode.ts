import TypeDoc from "typedoc";
import SignatureNode, {
  GithubStyledSignatureParameters,
} from "./SignatureNode.js";
import CommentNode from "./CommentNode.js";
import InheritedFromNode from "./InheritedFromNode.js";
import { SourceLinkDefinedInNode } from "./SourceLinkNode.js";
import { page } from "../markdown-components/page.js";
import { h3 } from "../markdown-components/heading.js";
import { linebreak } from "../markdown-components/linebreak.js";
import FlagsNode from "./FlagsNode.js";
import { UNICODE_WARNING_SYMBOL } from "../CONSTANTS.js";
import ExampleBlockNode from "./ExampleBlockNode.js";

/**
 * Markdown of a class reflection.
 */
export default function MethodNode(
  reflection: TypeDoc.Models.DeclarationReflection
): string {
  return page(
    reflection.signatures
      ? [
          reflection.signatures
            .map((signature) =>
              page(
                [h3(signature.name), FlagsNode(signature)],
                signature.inheritedFrom
                  ? [InheritedFromNode(signature.inheritedFrom)]
                  : [],
                [SignatureNode(signature)],
                [GithubStyledSignatureParameters(signature)],
                signature.comment ? [CommentNode(signature.comment)] : [],
                [ExampleBlockNode(signature.comment)],
                [SourceLinkDefinedInNode(reflection)]
              )
            )
            .join(linebreak()),
        ]
      : [
          `${UNICODE_WARNING_SYMBOL} ${reflection.getFullName()} does not have any signatures! ${UNICODE_WARNING_SYMBOL}`,
        ]
  );
}
