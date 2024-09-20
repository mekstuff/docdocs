/**
 * Typed with ❤️ @ mekstuff
 */

import TypeDoc from "typedoc";
import TypeNode from "./TypeNode.js";
import { UNICODE_WARNING_SYMBOL } from "../CONSTANTS.js";
import CommentNode, {
  CommentTagContentDisplayPartNode,
} from "./CommentNode.js";
import { page } from "../markdown-components/page.js";
import { codeblock } from "../markdown-components/codeblock.js";
import { sup } from "../markdown-components/sup.js";
import typeParameterNode from "./TypeParameterNode.js";

export const SpecialUnionSeperator = "｜";

/**
 * Markdown of a signature reflection.
 */
export default function SignatureNode(
  reflection: TypeDoc.Models.SignatureReflection
): string {
  return page(reflection.comment ? [CommentNode(reflection.comment)] : [], [
    codeblock(
      `${reflection.parent.name}${
        reflection.typeParameters
          ? `<${reflection.typeParameters
              .map((x) => typeParameterNode(x))
              .join(", ")}>`
          : ""
      }(` +
        reflection.parameters
          ?.map(
            (param) =>
              `${param.name}: ${
                param.type ? TypeNode(param.type) : UNICODE_WARNING_SYMBOL
              }`
          )
          .join(", ") +
        `): ${
          reflection.type
            ? TypeNode(reflection.type)
            : `any ${UNICODE_WARNING_SYMBOL}`
        }`,
      "ts"
    ),
  ]);
}

export function GithubStyledTable(headings: string[], content: string[][]) {
  const headingssStr = "| " + headings.join(" | ") + " | " + "\n";
  const headingsSplitters = "|" + headings.map(() => " - |").join("");
  const contentsStr = content
    .map((contents) => {
      return "|" + contents.map((content) => ` ${content} |`).join("");
    })
    .join("\n");
  return `${headingssStr}${headingsSplitters}\n${contentsStr}`;
}

/**
 * Creates a github styled table based on signature parameters
 */
export function GithubStyledSignatureParameters(
  reflection: TypeDoc.Models.SignatureReflection
): string {
  const hasReturnsBlockTag = reflection.comment?.blockTags.find(
    (x) => x.tag === "@returns"
  );
  const returnsText = sup(
    "returns " +
      (reflection.type
        ? TypeNode(reflection.type, undefined, true)
        : `any ${UNICODE_WARNING_SYMBOL}`) +
      (hasReturnsBlockTag
        ? ` - ${CommentTagContentDisplayPartNode(hasReturnsBlockTag.content)}`
        : "")
  );
  return (
    (reflection.parameters && reflection.parameters.length > 0
      ? `
| Parameter | Type | Documentation | Default |
| - | - | - | - |\n` +
        reflection.parameters
          ?.map(
            (x) =>
              x.name +
              " | " +
              (x.type
                ? TypeNode(x.type, SpecialUnionSeperator, true)
                : UNICODE_WARNING_SYMBOL) +
              " | " +
              (x.comment ? CommentNode(x.comment) : "-") +
              " | " +
              (x.defaultValue ?? "-")
          )
          .join("\n") +
        "\n\n> "
      : "") + returnsText
  );
}
