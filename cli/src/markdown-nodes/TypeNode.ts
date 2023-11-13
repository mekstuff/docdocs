import TypeDoc, { Serializer } from "typedoc";
import {
  UNICODE_OPEN_IN_NEW_WINDOW_SYMBOL,
  UNICODE_WARNING_SYMBOL,
} from "../CONSTANTS.js";

type TNode = {
  text: string;
  href: string;
};

/**
 * Converts TNode object to an anchor string.
 */
function FromTNodeToAnchor(TNode: TNode): string {
  return TNode.href
    ? `<a href=${TNode.href} target="_blank">${TNode.text}</a>`
    : TNode.text;
}

function IntrinsicType(Type: TypeDoc.IntrinsicType): TNode {
  return {
    text: Type.name,
    href: "#",
  };
}
//
function ReferenceType(Type: TypeDoc.ReferenceType): TNode {
  return {
    text: Type.name,
    href: "#",
  };
}

function ReflectionType(Type: TypeDoc.ReflectionType): TNode {
  const firstSource = Type.declaration.sources?.[0];
  if (!firstSource) {
    return {
      text: Type.toString() + ` ${UNICODE_WARNING_SYMBOL}`,
      href: "https://github.com/mekstuff/docdocs",
    };
  }
  return {
    text: Type.toString() + ` ${UNICODE_OPEN_IN_NEW_WINDOW_SYMBOL} `,
    href: `...`,
  };
}
/**
 * Markdown of a class reflection.
 */
export default function TypeNode(
  Type: TypeDoc.SomeType,
  unionSeperator?: string
): string {
  if (Type.type === "union") {
    return Type.types
      .map((x) => TypeNode(x))
      .join(`${unionSeperator ?? " | "}`);
  }
  if (Type.type === "intrinsic") {
    return FromTNodeToAnchor(IntrinsicType(Type));
  }

  if (Type.type === "reference") {
    return FromTNodeToAnchor(ReferenceType(Type));
  }
  if (Type.type === "reflection") {
    return FromTNodeToAnchor(ReflectionType(Type));
  }
  return FromTNodeToAnchor({
    href: undefined as unknown as string,
    text: Type.toString(),
  });
}

export function TypeAliasNode(
  reflection: TypeDoc.Models.DeclarationReflection
): string {
  return reflection.type ? TypeNode(reflection.type) : "";
}
