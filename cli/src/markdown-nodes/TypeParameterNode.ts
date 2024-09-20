/**
 * Typed with ❤️ @ mekstuff
 */

import TypeDoc from "typedoc";
import TypeNode from "./TypeNode.js";
/**
 * Markdown of a type parameter reflection.
 */
export default function typeParameterNode(
  typeParameter: TypeDoc.TypeParameterReflection
): string {
  const _extends = typeParameter.type
    ? ` extends ${TypeNode(typeParameter.type)}`
    : "";
  const _default = typeParameter.default
    ? ` = ${TypeNode(typeParameter.default)}`
    : "";
  return `${typeParameter.name}${_extends}${_default}`;
}
