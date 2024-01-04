import TypeDoc from "typedoc";
import FlagsNode from "./FlagsNode.js";
import { SupportedApiRoutes } from "../utils/core.js";
import SourceLinkNode from "./SourceLinkNode.js";
import { page } from "../markdown-components/page.js";
import { h1 } from "../markdown-components/heading.js";
import { admonition } from "../markdown-components/admonition.js";

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
  return page(
    [h1(reflection.name), FlagsNode(reflection)],
    SortedChildren.class
      ? [
          admonition(
            SortedChildren.class
              .sort()
              .map(
                (x) =>
                  `<a href="/api/class/${x.name.toLowerCase()}">${x.name}</a>`
              )
              .join(", "),
            "info",
            "Classes"
          ),
        ]
      : [],
    SortedChildren.function
      ? [
          admonition(
            SortedChildren.function
              .sort()
              .map(
                (x) =>
                  `<a href="/api/function/${x.name.toLowerCase()}">${
                    x.name
                  }</a>`
              )
              .join(", "),
            "info",
            "Functions"
          ),
        ]
      : [],
    SortedChildren.interface
      ? [
          admonition(
            SortedChildren.interface
              .sort()
              .map(
                (x) =>
                  `<a href="/api/interface/${x.name.toLowerCase()}">${
                    x.name
                  }</a>`
              )
              .join(", "),
            "info",
            "Interfaces"
          ),
        ]
      : [],
    SortedChildren.type
      ? [
          admonition(
            SortedChildren.type
              .sort()
              .map(
                (x) =>
                  `<a href="/api/type/${x.name.toLowerCase()}">${x.name}</a>`
              )
              .join(", "),
            "info",
            "Types"
          ),
        ]
      : [],

    [SourceLinkNode(reflection)]
  );
}
