import TypeDoc from "typedoc";
import FlagsNode from "./FlagsNode.js";
import { SupportedApiRoutes } from "../utils/core.js";
import SourceLinkNode from "./SourceLinkNode.js";

/**
 * Markdown of a variable reflection.
 */
export default function ModuleNode(
  reflection: TypeDoc.Models.DeclarationReflection
): string {
  const SortedChildren: Record<string, TypeDoc.DeclarationReflection[]> = {};
  const addToSortedChildren = (
    n: SupportedApiRoutes,
    v: TypeDoc.DeclarationReflection
  ) => {
    const e = SortedChildren[n];
    if (e) {
      SortedChildren[n].push(v);
    } else {
      SortedChildren[n] = [v];
    }
  };
  reflection.children?.forEach((x) => {
    if (x.kind === TypeDoc.ReflectionKind.Class) {
      addToSortedChildren("class", x);
    }
    if (x.kind === TypeDoc.ReflectionKind.Function) {
      addToSortedChildren("function", x);
    }
    if (x.kind === TypeDoc.ReflectionKind.Interface) {
      addToSortedChildren("interface", x);
    }
    if (x.kind === TypeDoc.ReflectionKind.TypeAlias) {
      addToSortedChildren("type", x);
    }
  });
  return `# ${reflection.name} ${FlagsNode(
    reflection.flags,
    reflection.comment
  )}

${
  SortedChildren.class
    ? `:::info Classes
${SortedChildren.class
  .sort()
  .map((x) => `<a href="/api/class/${x.name.toLowerCase()}">${x.name}</a>`)
  .join(",\n\n")}
:::`
    : ""
}
${
  SortedChildren.function
    ? `:::info Functions
${SortedChildren.function
  .sort()
  .map((x) => `<a href="/api/function/${x.name.toLowerCase()}">${x.name}</a>`)
  .join(",\n\n")}
:::`
    : ""
}
${
  SortedChildren.interface
    ? `:::info Interfaces
${SortedChildren.interface
  .sort()
  .map((x) => `<a href="/api/interface/${x.name.toLowerCase()}">${x.name}</a>`)
  .join(",\n\n")}
:::`
    : ""
}
${
  SortedChildren.type
    ? `:::info Types
${SortedChildren.type
  .sort()
  .map((x) => `<a href="/api/type/${x.name.toLowerCase()}">${x.name}</a>`)
  .join(",\n\n")}
:::`
    : ""
}

${SourceLinkNode(reflection)}

      `;
}
