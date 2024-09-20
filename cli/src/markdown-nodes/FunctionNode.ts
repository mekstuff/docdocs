/**
 * Typed with ❤️ @ mekstuff
 */

import TypeDoc from "typedoc";
import SignatureNode, {
  GithubStyledSignatureParameters,
} from "./SignatureNode.js";
import FlagsNode from "./FlagsNode.js";
import { SourceLinkDefinedInNode } from "./SourceLinkNode.js";
import { page } from "../markdown-components/page.js";
import { h1 } from "../markdown-components/heading.js";
import { linebreak } from "../markdown-components/linebreak.js";
import ExampleBlockNode from "./ExampleBlockNode.js";

/**
 * Markdown of a function reflection.
 */
export default function FunctionNode(
  reflection: TypeDoc.Models.DeclarationReflection
): string {
  return page(
    [h1(reflection.name), FlagsNode(reflection)],
    reflection.signatures
      ? [
          reflection.signatures
            .map((signature) =>
              page(
                [SignatureNode(signature)],
                [GithubStyledSignatureParameters(signature)]
              )
            )
            .join(linebreak()),
        ]
      : [],
    [ExampleBlockNode(reflection.comment)],
    [SourceLinkDefinedInNode(reflection)]
  );
}
