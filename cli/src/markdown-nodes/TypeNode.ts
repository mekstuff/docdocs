/**
 * Typed with ❤️ @ mekstuff
 */

// TODO: Adding support for internal reference types that aren't exported to be displayed under a ## Types header at the top of the page
// Logic exists inside `src/utils/core` but has problems, view file for more information.

// TODO: Add reflection support,reflections will be e.g. const x: { a: ... }

import TypeDoc, { SomeType } from "typedoc";
import { UNICODE_WARNING_SYMBOL } from "../CONSTANTS.js";
import { GetDocDocsConfig } from "../utils/core.js";
import { Console } from "@mekstuff/logreport";
import { ReferenceDocDocsConfigurationPath } from "../configuration.js";
import { anchor } from "../markdown-components/anchor.js";
import { GetTypeDocProject } from "../utils/typedoc-bootstrap.js";
import { codeblock } from "../markdown-components/codeblock.js";
import { page } from "../markdown-components/page.js";
import { GithubStyledTable, SpecialUnionSeperator } from "./SignatureNode.js";
import { h1 } from "../markdown-components/heading.js";
import CommentNode from "./CommentNode.js";
import {
  linebreak,
  linebreakWithDashes,
} from "../markdown-components/linebreak.js";
import PropertyNode from "./PropertyNode.js";

type TNode = {
  text: string;
  href?: string;
};

const BACK_TICK_HTML_ENTITY = "&#96;";

/**
 * Converts TNode object to an anchor string.
 */
function FromTNodeToAnchor(TNode: TNode): string {
  return anchor(TNode.text, TNode.href);
}

function IntrinsicType(Type: TypeDoc.IntrinsicType): TNode {
  return {
    text: Type.name,
  };
}

function ArrayType(Type: TypeDoc.ArrayType): TNode {
  return {
    text: Type.toString(),
    href: `#`,
  };
}
/**
 * Markdown of a type reflection.
 */
export default function TypeNode(
  Type: TypeDoc.SomeType,
  unionSeperator?: string,
  asAnchorTag?: boolean,
  _refTypeDepth: number = 1,
  _refTypeContents?: { n: string; node: string }[],
  _refTypeParentName?: string
): string {
  const returnAsAnchorOrNot = (Default: string, AsAnchor?: string): string => {
    return asAnchorTag ? AsAnchor ?? Default : Default;
  };
  if (Type.type === "literal") {
    return returnAsAnchorOrNot(Type.toString());
  }
  if (Type.type === "unknown") {
    return returnAsAnchorOrNot(
      Type.toString(),
      FromTNodeToAnchor({
        text: "unknown",
      })
    );
  }
  if (Type.type === "intrinsic") {
    return returnAsAnchorOrNot(
      Type.toString(),
      FromTNodeToAnchor(IntrinsicType(Type))
    );
  }
  if (Type.type === "reference") {
    let anchorLink = "#";
    if (Type.refersToTypeParameter) {
      // infer or generic?
      return returnAsAnchorOrNot(Type.name);
    }
    if (Type.reflection) {
      // internal/resolved reference ( it was exported internally ).
    } else {
      if (!Type.package) {
        return `The package for the ReferenceType is not defined. ${UNICODE_WARNING_SYMBOL} `;
      }
      if (!Type.symbolId) {
        return `The symbolId for the ReferenceType is not defined for some odd reason. ${UNICODE_WARNING_SYMBOL} `;
      }
      // a reference can be internal but not exported.
      const TDProject = GetTypeDocProject();
      if (!TDProject) {
        Console.error(
          "The TypeDoc project has not yet be initiated or was removed."
        );
        return `${UNICODE_WARNING_SYMBOL} The TypeDoc project has not yet be initiated or was removed ${UNICODE_WARNING_SYMBOL}`;
      }
      if (TDProject.name === Type.package) {
        return returnAsAnchorOrNot(
          `${Type.name}🔒`,
          `${Type.name} <DBadge text="private" emoji="🔒"/>`
        );
        // console.log(Type.fromObject(new TypeDoc.Deserializer(GetTypeDocApplication())))
        // the type was defined but was not exported, display it at the top of the page
        // vueonce(`{{ AddTypeDefinitionToPage("x") }}`)
        // return returnAsAnchorOrNot(
        //   // Type.toString(),
        //   // FromTNodeToAnchor({
        //   //   text: Type.toString(),
        //   //   href: `#${Type.toString()}`
        //   // })
        //   `SUPPORT FOR TYPES LISTED AT TOP IS WIP. ${UNICODE_WARNING_SYMBOL}`
        //   // Type.toString(),
        //   // vueonce(`{{ AddTypeDefinitionToPage("${codeblock("hello")}") }}`) +
        //   //   Type.toString()
        // );
      }
      // reference is detected as external.
      const DDConfig = GetDocDocsConfig();
      const LinkResolver =
        DDConfig.TypeNodeReferenceTypeLinkResolver[Type.package];
      if (!LinkResolver) {
        const err = `Your ${ReferenceDocDocsConfigurationPath(
          "TypeNodeReferenceTypeLinkResolver"
        )} did not specify how to resolve links from "${Type.package}"`;

        // Console.error(err, true);
        return `${UNICODE_WARNING_SYMBOL} - ${err}`;
      }
      // TODO: We should pass the "kind" of type. e.g. "class", "enum", etc.
      const link = LinkResolver({
        name: Type.name,
        package: Type.package,
        fileName: Type.symbolId.fileName,
      });
      Console.assert(
        typeof link === "string",
        `${ReferenceDocDocsConfigurationPath(
          "TypeNodeReferenceTypeLinkResolver"
        )} callback for "${Type.package}" did not return a string.`
      );
      anchorLink = link;
    }
    return (
      returnAsAnchorOrNot(Type.name, anchor(Type.name, anchorLink, "_blank")) +
      (Type.typeArguments && Type.typeArguments.length > 0
        ? `<${Type.typeArguments.map((x) =>
            TypeNode(x, unionSeperator, asAnchorTag)
          )}>`
        : "")
    );
  }
  if (Type.type === "array") {
    return returnAsAnchorOrNot(
      Type.toString(),
      FromTNodeToAnchor(ArrayType(Type))
    );
  }
  //
  if (Type.type === "reflection") {
    _refTypeContents = _refTypeContents ?? [];
    const str =
      Type.declaration.children
        ?.map((child) => {
          if (!child.type) {
            return;
          }
          if ((child.type as SomeType).type !== "reflection") {
            _refTypeContents?.push({
              n: `${
                _refTypeParentName !== undefined ? `${_refTypeParentName}.` : ""
              }${child.name}`,
              node: TypeNode(child.type, SpecialUnionSeperator, true),
            });
          }
          return `${"\t".repeat(_refTypeDepth)}${child.name}: ${TypeNode(
            child.type,
            undefined,
            undefined,
            _refTypeDepth + 1,
            _refTypeContents,
            (_refTypeParentName !== undefined ? _refTypeParentName + "." : "") +
              child.name
          )}`;
        })
        .filter(Boolean)
        .join(",\n") ?? "";

    let returning = returnAsAnchorOrNot(
      `{\n${str}\n${"\t".repeat(_refTypeDepth - 1)}}`,
      page(
        [Type.declaration.name],
        [codeblock(`type ${Type.declaration} = {\n${str}\n}`, "ts")]
      )
    );
    if (asAnchorTag && _refTypeDepth === 1) {
      const GroupedByTypes: Record<string, string[]> = {};
      _refTypeContents.forEach((x) => {
        GroupedByTypes[x.node] = GroupedByTypes[x.node] || [];
        GroupedByTypes[x.node].push(x.n);
      });
      const _references = [];
      for (const x in GroupedByTypes) {
        const t = GroupedByTypes[x];
        _references.push([t.join(SpecialUnionSeperator), x]);
      }
      returning =
        returning + "\n" + GithubStyledTable(["Key", "Type"], _references);
    }
    return returning;
  }
  if (Type.type === "union") {
    return Type.types
      .map((x) => TypeNode(x, unionSeperator, asAnchorTag))
      .join(`${unionSeperator ?? " | "}`);
  }
  if (Type.type === "intersection") {
    return Type.types
      .map((x) => TypeNode(x, unionSeperator, asAnchorTag))
      .join(`${unionSeperator ?? " & "}`);
  }
  if (Type.type === "tuple") {
    return (
      "[" +
      Type.elements
        .map((x) => TypeNode(x, unionSeperator, asAnchorTag))
        .join(", ") +
      "]"
    );
  }
  if (Type.type === "conditional") {
    return `${TypeNode(
      Type.checkType,
      unionSeperator,
      asAnchorTag
    )} extends ${TypeNode(
      Type.extendsType,
      unionSeperator,
      asAnchorTag
    )} ? ${TypeNode(Type.trueType, unionSeperator, asAnchorTag)} : ${TypeNode(
      Type.falseType,
      unionSeperator,
      asAnchorTag
    )}`;
  }
  if (Type.type === "namedTupleMember") {
    return `${Type.name}${Type.isOptional ? "?" : ""}: ${TypeNode(
      Type.element,
      unionSeperator,
      asAnchorTag
    )}`;
  }
  if (Type.type === "templateLiteral") {
    return `${BACK_TICK_HTML_ENTITY}${Type.head}${Type.tail
      .map((x) =>
        x
          .map((q) =>
            typeof q === "string" ? q : TypeNode(q, unionSeperator, asAnchorTag)
          )
          .join("")
      )
      .join("")}${BACK_TICK_HTML_ENTITY}`;
  }
  if (Type.type === "mapped") {
    const templateType = TypeNode(
      Type.templateType,
      unionSeperator,
      asAnchorTag
    );
    const readonlyModifierText = Type.readonlyModifier
      ? ` \`${Type.readonlyModifier}readonly\` `
      : "";
    const optionalModifierText = Type.optionalModifier
      ? ` \`${Type.readonlyModifier}?\` `
      : "";
    return `&#x7B; ${readonlyModifierText} [${TypeNode(
      Type.parameterType,
      unionSeperator,
      asAnchorTag
    )} in ${TypeNode(
      Type.templateType,
      unionSeperator,
      asAnchorTag
    )}]${optionalModifierText}: ${templateType} &#x7D;`;
  }
  if (Type.type === "predicate") {
    return `${Type.asserts ? "asserts" : ""} \`${Type.name}\` is ${
      Type.targetType
        ? TypeNode(Type.targetType, unionSeperator, asAnchorTag)
        : `??? ${UNICODE_WARNING_SYMBOL}`
    }`;
  }
  if (Type.type === "rest") {
    return `...${TypeNode(Type.elementType, unionSeperator, asAnchorTag)}`;
  }
  if (Type.type === "query") {
    return TypeNode(Type.queryType, unionSeperator, asAnchorTag);
  }
  if (Type.type === "optional") {
    return TypeNode(Type.elementType, unionSeperator, asAnchorTag) + "?";
  }
  if (Type.type === "typeOperator") {
    return `${
      BACK_TICK_HTML_ENTITY + Type.operator + BACK_TICK_HTML_ENTITY
    } ${TypeNode(Type.target, unionSeperator, asAnchorTag)}`;
  }

  return returnAsAnchorOrNot(
    Type.toString() + UNICODE_WARNING_SYMBOL,
    FromTNodeToAnchor({
      href: undefined as unknown as string,
      text: Type.toString() + UNICODE_WARNING_SYMBOL,
    })
  );
}

export function TypeAliasNode(
  reflection: TypeDoc.Models.DeclarationReflection
): string {
  return page(
    [h1(reflection.name)],
    reflection.comment ? [CommentNode(reflection.comment)] : [],
    [linebreakWithDashes()],
    [PropertyNode(reflection)]
  );
}
