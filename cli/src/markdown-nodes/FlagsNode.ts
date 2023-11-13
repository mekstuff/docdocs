// TODO: Unknown flags aren't captured by typedoc for functions, only works for classes, will need to implement.

import TypeDoc from "typedoc";
import { GetDocDocsConfig } from "../utils/core.js";
import { Console } from "@mekstuff/logreport";
import { DocDocsConfiguration } from "../configuration.js";

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
 * @param comment Gets the BlockNodes that we use as flags.
 */
export default function FlagsNode(
  flags: TypeDoc.Models.ReflectionFlags,
  comment?: TypeDoc.Models.Comment | undefined
): string {
  const BadgeBlocks: DocDocsConfiguration["CommentTagBadges"] = [];
  return `${flags
    .map((x) => {
      const [BadgeString, BadgeInConfig] = GetFlagNodeBadge(x);
      if (BadgeInConfig && BadgeInConfig.contentBlock !== undefined) {
        BadgeBlocks.push(BadgeInConfig);
      }
      return BadgeString;
    })
    .join(" ")} ${
    comment
      ? comment.blockTags
          .map((x) => {
            const [BadgeString, BadgeInConfig] = GetFlagNodeBadge(x.tag);
            if (BadgeInConfig && BadgeInConfig.contentBlock !== undefined) {
              BadgeBlocks.push(BadgeInConfig);
            }
            return BadgeString;
          })
          .join(" ")
      : ""
  }

  ${BadgeBlocks.map((x) => {
    return `:::${x.contentBlock?.type} ${x.contentBlock?.title ?? ""}
${x.contentBlock?.content}
:::
    `;
  }).join("\n")}
    `;
}
