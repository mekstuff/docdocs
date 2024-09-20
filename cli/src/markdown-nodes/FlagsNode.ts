/**
 * Typed with ❤️ @ mekstuff
 */

// TODO: Unknown flags aren't captured by typedoc for functions, only works for classes, will need to implement.

import TypeDoc from "typedoc";
import { GetDocDocsConfig } from "../utils/core.js";
import { Console } from "@mekstuff/logreport";
import { DocDocsConfiguration } from "../configuration.js";
import { page } from "../markdown-components/page.js";
import { admonition } from "../markdown-components/admonition.js";
import { CommentTagContentDisplayPartNode } from "./CommentNode.js";
import { linebreak } from "../markdown-components/linebreak.js";

/**
 * Removes `@` from the start of the tag if any and makes the tag lowerCase
 */
export function ExtractTagFlagName(tag: string): string {
  let v = tag.toLowerCase();
  if (v.match("^@")) {
    v = tag.substring(1);
  }
  return v;
}

/**
 * Gets the badge string for the flag/tag
 */
function GetFlagNodeBadge(
  tag: string
): [string, DocDocsConfiguration["CommentTagBadges"][number] | undefined] {
  tag = ExtractTagFlagName(tag);
  const ddconfig = GetDocDocsConfig();
  const BadgeInConfig = ddconfig.CommentTagBadges.find(
    (x) => ExtractTagFlagName(x.tag) === tag
  );
  if (BadgeInConfig) {
    // const str = BadgeInConfig.emoji ? `${BadgeInConfig.emoji} ${tag}` : tag;
    return [
      `<DBadge ${
        BadgeInConfig.emoji ? `emoji="${BadgeInConfig.emoji}"` : ""
      } text="${tag}" />`,
      BadgeInConfig,
    ];
  } else {
    // if it's a @ddtag then we do not need to warn or create a badge error output.
    if (!tag.match("^dd")) {
      Console.warn(
        `The badge tag "${tag}" was not found your configurations "CommentTagBadges".`
      );
      return [`<DBadge text="Badge Error, View Output" />`, undefined];
    }
    return ["", undefined];
  }
}

/**
 * Makrdown of flag reflections
 *
 * FlagsNode are expected to be placed inline with a heading, e.g. properties and methods.
 *
 * @param comment Gets the BlockNodes that we use as flags.
 */
export default function FlagsNode(
  reflection: TypeDoc.Models.Reflection
): string {
  const flags = reflection.flags;
  const blocktags = reflection.comment?.blockTags ?? [];

  const InLineBadages: string[] = [];
  const contentBlocksFromBadges: string[] = [];
  flags.forEach((x) => {
    const [BadgeString, BadgeInConfig] = GetFlagNodeBadge(x);
    if (BadgeInConfig !== undefined && BadgeInConfig.noBadge !== true) {
      InLineBadages.push(BadgeString);
    }
  });
  blocktags.forEach((x) => {
    const [BadgeString, BadgeInConfig] = GetFlagNodeBadge(x.tag);
    if (BadgeInConfig !== undefined) {
      if (BadgeInConfig.noBadge !== true) {
        InLineBadages.push(BadgeString);
      }
      if (BadgeInConfig.contentBlock !== undefined) {
        contentBlocksFromBadges.push(
          admonition(
            x.content.length > 9
              ? CommentTagContentDisplayPartNode(x.content)
              : typeof BadgeInConfig.contentBlock.content === "function"
              ? BadgeInConfig.contentBlock.content(
                  x,
                  CommentTagContentDisplayPartNode(x.content)
                )
              : BadgeInConfig.contentBlock.content,
            BadgeInConfig.contentBlock.type,
            typeof BadgeInConfig.contentBlock.title === "function"
              ? BadgeInConfig.contentBlock.title(
                  x,
                  CommentTagContentDisplayPartNode(x.content)
                )
              : BadgeInConfig.contentBlock.title
          )
        );
      }
    }
  });

  // console.log(
  //   reflection.name,
  //   flags,
  //   blocktags,
  //   reflection.comment?.modifierTags
  // );
  return page(
    [InLineBadages.join(" ")],
    [contentBlocksFromBadges.join(linebreak())]
  );
  // [
  //   flags
  //     .map((flag) => {
  //       const [BadgeString, BadgeInConfig] = GetFlagNodeBadge(flag);
  //       if (BadgeInConfig && BadgeInConfig.contentBlock !== undefined) {
  //         BadgeBlocks.push(BadgeInConfig);
  //       }
  //       return BadgeString;
  //     })
  //     .join(" "),
  // ],
  // comment
  //   ? [
  //       comment.blockTags
  //         .map((blocktag) => {
  //           const [BadgeString, BadgeInConfig] = GetFlagNodeBadge(
  //             blocktag.tag
  //           );
  //           if (BadgeInConfig && BadgeInConfig.contentBlock !== undefined) {
  //             BadgeBlocks.push(BadgeInConfig);
  //           }
  //           return BadgeString;
  //         })
  //         .join(" "),
  //     ]
  //   : [],
  // [
  //   BadgeBlocks.map((x) => {
  //     return admonition(
  //       x.contentBlock?.content,
  //       x.contentBlock?.type,
  //       x.contentBlock?.title
  //     );
  //   }).join(linebreak()),
  // ]
}
