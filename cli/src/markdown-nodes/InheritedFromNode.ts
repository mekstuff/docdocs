import TypeDoc from "typedoc";
import { INHERITANCE_EMOJI } from "../CONSTANTS.js";
import { sup } from "../markdown-components/sup.js";

export default function InheritedFromNode(
  Reference: TypeDoc.Models.ReferenceType
): string {
  const n = Reference.name.toLowerCase().replace(/\./g, "#");
  // const reflectionParentKindOf = Reference.reflection?.parent?.kindOf;
  // // const apiRoute = reflectionParentKindOf
  // //   ? "../" +
  // //     (reflectionParentKindOf(TypeDoc.ReflectionKind.Class)
  // //       ? "class"
  // //       : reflectionParentKindOf(TypeDoc.ReflectionKind.Function)
  // //       ? "function"
  // //       : reflectionParentKindOf(TypeDoc.ReflectionKind.Interface)
  // //       ? "interface"
  // //       : "type") +
  // //     `/${n}`
  // //   : `./${Reference.name}`;
  // const ReflectionKind =
  // const apiRouteDir =
  // console.log(TypeDoc.ReflectionKind.Class, Reference.reflection?.parent?.kind.);
  return (
    "> " +
    sup(
      `${INHERITANCE_EMOJI} Inherited from <a href="./${n}">${Reference.name} </a>`
    )
  );
}
