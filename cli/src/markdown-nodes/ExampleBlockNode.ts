/**
 * Typed with ❤️ @ mekstuff
 */

import TypeDoc from "typedoc";
import { GetDocDocsConfig } from "../utils/core.js";

/**
 * Markdown of an example block node, fetched from the comment model.
 */
export default function ExampleBlockNode(
  comment: TypeDoc.Models.Comment | undefined,
  appendAtStart?: string
): string {
  const DDConfig = GetDocDocsConfig();
  if (!DDConfig.DisplayCodeBlockExamplesAtEndOfNode) {
    return "";
  }
  if (!comment) {
    return "";
  }
  const exampleBlocks = comment.blockTags
    .map((x) => (x.tag === "@example" ? x : null))
    .filter(Boolean);
  if (exampleBlocks.length > 0) {
    return `${appendAtStart ? appendAtStart : ""}
::: details Example${exampleBlocks.length > 1 ? "s" : ""}
${exampleBlocks
  .map((x) => x?.content.map((x) => x.text).join("\n"))
  .join("\n\n---\n\n")}
:::`;
  }
  return "";
}
