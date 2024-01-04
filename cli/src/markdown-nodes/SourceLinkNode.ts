import TypeDoc from "typedoc";
import { GetDocDocsConfig } from "../utils/core.js";
import { sup } from "../markdown-components/sup.js";
import { linebreak } from "../markdown-components/linebreak.js";
/**
 * Markdown of a source link reflection.
 */
export default function SourceLinkNode(
  reflection: TypeDoc.Models.DeclarationReflection
): string {
  return `${
    reflection.sources
      ? reflection.sources
          .map((x) => `<a target="_blank" href="#">${x.fullFileName}</a>`)
          .join("\n")
      : ""
  }`;
}

/**
 * Markdown of source link reflection.
 *
 * Does the same as `SourceLinkNode` but instead adds text "defined in" at the start and is in a smaller size.
 */
export function SourceLinkDefinedInNode(
  reflection: TypeDoc.Models.DeclarationReflection
): string {
  const DDConfig = GetDocDocsConfig();
  return DDConfig.LinkToReflectionSource === true
    ? `${
        reflection.sources
          ? reflection.sources
              .map((x) =>
                sup(
                  `Defined in <a href="#">${x.fullFileName}:${x.line}:${x.character}</a>`,
                  2
                )
              )
              .join(linebreak())
          : ""
      }`
    : "";
}
