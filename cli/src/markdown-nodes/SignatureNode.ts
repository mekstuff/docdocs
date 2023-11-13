import TypeDoc from "typedoc";
import TypeNode from "./TypeNode.js";
import { UNICODE_WARNING_SYMBOL } from "../CONSTANTS.js";
import CommentNode from "./CommentNode.js";

/**
 * Markdown of a signature reflection.
 */
export default function SignatureNode(
  reflection: TypeDoc.Models.SignatureReflection
): string {
  return `:::info (${reflection.parameters
    ?.map(
      (x) => `${x.name}: ${x.type ? TypeNode(x.type) : UNICODE_WARNING_SYMBOL}`
    )
    .join(", ")}): ${
    reflection.type
      ? TypeNode(reflection.type)
      : `any ${UNICODE_WARNING_SYMBOL}`
  } 
  \n:::`;
}

/**
 * Creates a github styled table based on signature parameters
 *
 */

export function GithubStyledSignatureParameters(
  reflection: TypeDoc.Models.SignatureReflection
): string {
  return (
    `
| Parameter | Type | Default | Documentation |
| - | - | - | - |\n` +
    reflection.parameters
      ?.map(
        (x) =>
          x.name +
          " | " +
          (x.type ? TypeNode(x.type, "｜") : UNICODE_WARNING_SYMBOL) +
          " | " +
          (x.defaultValue ?? "-") +
          " | " +
          (x.comment ? CommentNode(x.comment) : "-")
      )
      .join("\n")
  );
}
