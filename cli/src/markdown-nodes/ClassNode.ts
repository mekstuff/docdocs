/**
 * Typed with ❤️ @ mekstuff
 */

import TypeDoc from "typedoc";
import FlagsNode from "./FlagsNode.js";
import CommentNode from "./CommentNode.js";
import PropertyNode from "./PropertyNode.js";
import MethodNode from "./MethodNode.js";
import { SourceLinkDefinedInNode } from "./SourceLinkNode.js";
import SignatureNode, {
  GithubStyledSignatureParameters,
} from "./SignatureNode.js";
import { page } from "../markdown-components/page.js";
import { h1, h2, h3 } from "../markdown-components/heading.js";
import {
  linebreak,
  linebreakWithDashes,
} from "../markdown-components/linebreak.js";
import InheritedFromNode from "./InheritedFromNode.js";
import ExampleBlockNode from "./ExampleBlockNode.js";

/**
 * Markdown of a class reflection.
 */
export default function ClassNode(
  reflection: TypeDoc.Models.DeclarationReflection
): string {
  const Properties = reflection.getChildrenByKind(
    TypeDoc.Models.ReflectionKind.Property
  );
  const Methods = reflection.getChildrenByKind(
    TypeDoc.Models.ReflectionKind.Method
  );
  const Constructors = reflection.getChildrenByKind(
    TypeDoc.Models.ReflectionKind.Constructor
  );

  return page(
    [h1(reflection.name), FlagsNode(reflection)],
    [SourceLinkDefinedInNode(reflection)],
    [reflection.comment ? CommentNode(reflection.comment) : ""],
    Constructors.length > 0
      ? [
          h2("Constructors"),
          linebreak(),
          Constructors.map((constructor) =>
            page(
              [h3(constructor.name)],
              constructor.signatures
                ? [
                    constructor.signatures
                      .map((signature) =>
                        page(
                          signature.inheritedFrom
                            ? [InheritedFromNode(signature.inheritedFrom)]
                            : [],
                          [SignatureNode(signature)],
                          [GithubStyledSignatureParameters(signature)]
                        )
                      )
                      .join(linebreakWithDashes()),
                    linebreak(),
                    SourceLinkDefinedInNode(constructor),
                  ]
                : []
            )
          ).join(""),
        ]
      : [],
    Properties.length > 0
      ? [
          h2("Properties"),
          linebreak(),
          Properties.map((property) => PropertyNode(property)).join(
            linebreakWithDashes()
          ),
        ]
      : [],
    Methods.length > 0
      ? [
          h2("Methods"),
          linebreak(),
          Methods.map((method) => MethodNode(method)).join(
            linebreakWithDashes()
          ),
        ]
      : [],
    [ExampleBlockNode(reflection.comment)]
  );
}
