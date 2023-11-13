import TypeDoc from "typedoc";
import { INHERITANCE_EMOJI } from "../CONSTANTS.js";

export default function InheritedFromNode(
  Reference: TypeDoc.Models.ReferenceType
): string {
  return `> ${INHERITANCE_EMOJI} Inherited from <a href="./${Reference.name
    .toLowerCase()
    .replace(/\./g, "#")}">${Reference.name} </a>`;
}
