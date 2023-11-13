import fs from "fs";
import TypeDoc from "typedoc";
import ClassNode from "../markdown-nodes/ClassNode.js";
import FunctionNode from "../markdown-nodes/FunctionNode.js";
import ModuleNode from "../markdown-nodes/ModuleNode.js";
import Pluralize from "pluralize";
import { Console } from "@mekstuff/logreport";
import {
  AddToApiRoute,
  GetDocDocsConfig,
  GetSubApiRoute,
  SupportedApiRoutes,
} from "./core.js";
import path from "path";

import {
  AddNavLinkToViteUserConfig,
  ResolveApiSidebar,
} from "./vite-config.js";
import InterfaceNode from "../markdown-nodes/InterfaceNode.js";
import { TypeAliasNode } from "../markdown-nodes/TypeNode.js";

/**
 * Log a conflict between sources.
 */
export function GetLogForSourceConflict(
  ...Sources: (TypeDoc.SourceReference[] | undefined)[]
): string {
  return Sources.map((x) =>
    x === undefined
      ? "Could not get source."
      : x
          .map(
            (q) =>
              `File: ${q.fileName}\nPath: ${q.fullFileName}:${q.line}:${q.character}`
          )
          .join("\n")
  ).join("\n\n");
}

/**
 * Transpile a group of reflections by type.
 */
function transpileGroupedReflections(
  Reflections: TypeDoc.Models.Reflection[],
  directory: string,
  GroupType: SupportedApiRoutes,
  /* eslint-disable @typescript-eslint/no-explicit-any */
  TargetNode: (...args: any) => any
) {
  const GroupInDir = GetSubApiRoute(directory, GroupType);
  if (GroupInDir !== undefined) {
    // removed unused items
    fs.readdirSync(GroupInDir).forEach((x) => {
      if (
        Reflections.find(
          (c) => c.name.toLowerCase() === path.parse(x).name.toLowerCase()
        ) === undefined
      ) {
        try {
          fs.rmSync(path.join(GroupInDir, x));
        } catch (err) {
          Console.warn(
            `Could not remove unused ${GroupType} from directory. Manually delete the following file:\n\n${path.join(
              GroupInDir,
              x
            )}`
          );
        }
      }
    });
  }
  const TranspilerLog = Console.log(``);
  const reflectionNameEntries: {
    name: string;
    sourceRef: TypeDoc.SourceReference[] | undefined;
  }[] = [];
  Reflections.forEach((x) => {
    if (x.isDeclaration()) {
      // check if a previous reflection exist with the same name
      const find = reflectionNameEntries.find(
        (q) => q.name.toLowerCase() === x.name.toLowerCase()
      );
      if (find !== undefined) {
        Console.error(
          `Conflicting reflections for ${GroupType}, "${x.name}"`,
          true
        );
        Console.LOG(GetLogForSourceConflict(find.sourceRef, x.sources));
        Console.LOG(`^^^ Fix conflicts and try building again ^^^\n\n`);
        process.exit(1);
      }
      const parsedNameForApi = path.parse(x.name).name; // parse name since we do not want directories in name, so nested files nest/index.ts will just be /index.ts
      reflectionNameEntries.push({
        name: parsedNameForApi,
        sourceRef: x.sources,
      });
      TranspilerLog(`Transpiling ${GroupType} ${x.name}`);
      AddToApiRoute(
        directory,
        GroupType,
        parsedNameForApi,
        ".md",
        TargetNode(x)
      );
    }
  });
  TranspilerLog(
    `Transpiled ${Reflections.length} ${Pluralize(
      GroupType,
      Reflections.length
    )}.`
  );
}

/**
 * Entry transpiler for project reflection.
 */
export function transpileProject(
  project: TypeDoc.Models.ProjectReflection,
  directory: string
) {
  const DDConfig = GetDocDocsConfig();
  if (DDConfig.ApiReference.NoApiReference === true) {
    return;
  }

  const ClassReflections = project.getReflectionsByKind(
    TypeDoc.Models.ReflectionKind.Class
  );
  transpileGroupedReflections(ClassReflections, directory, "class", ClassNode);

  const FunctionReflections = project.getReflectionsByKind(
    TypeDoc.Models.ReflectionKind.Function
  );
  transpileGroupedReflections(
    FunctionReflections,
    directory,
    "function",
    FunctionNode
  );

  const InterfaceReflections = project.getReflectionsByKind(
    TypeDoc.Models.ReflectionKind.Interface
  );
  transpileGroupedReflections(
    InterfaceReflections,
    directory,
    "interface",
    InterfaceNode
  );

  const TypeAliasReflections = project.getReflectionsByKind(
    TypeDoc.Models.ReflectionKind.TypeAlias
  );
  transpileGroupedReflections(
    TypeAliasReflections,
    directory,
    "type",
    TypeAliasNode
  );

  const ModuleReflections = project.getReflectionsByKind(
    TypeDoc.Models.ReflectionKind.Module
  );
  transpileGroupedReflections(
    ModuleReflections,
    directory,
    "module",
    ModuleNode
  );

  //create api reference navigation
  if (ClassReflections.length > 0) {
    let ApiConfigLinkText: string | undefined =
      DDConfig.ApiReference.NavigationLinkText;
    if (ApiConfigLinkText === "") {
      Console.warn(
        "An empty string cannot be used as the ApiNavigationLinkText"
      );
      ApiConfigLinkText = undefined;
    }
    // Get the first api link that is used when selecting `Api Reference` anchor.
    const apiEntryLink =
      ModuleReflections.length > 0
        ? `/api/module/${ModuleReflections[0].name.toLowerCase()}`
        : ClassReflections.length > 0
        ? `/api/class/${ClassReflections[0].name.toLowerCase()}`
        : FunctionReflections.length > 0
        ? `/api/function/${FunctionReflections[0].name.toLowerCase()}`
        : InterfaceReflections.length > 0
        ? `/api/interface/${InterfaceReflections[0].name.toLowerCase()}`
        : TypeAliasReflections.length > 0
        ? `/api/type/${TypeAliasReflections[0].name.toLowerCase()}`
        : "";
    AddNavLinkToViteUserConfig(directory, {
      link: apiEntryLink,
      activeMatch: "/api/",
      text: ApiConfigLinkText ?? "Api Reference",
    });
  }

  // resolve the api sidebar for the `/api/` route.
  ResolveApiSidebar(directory, {
    Modules: ModuleReflections,
    Classes: ClassReflections,
    Functions: FunctionReflections,
    Interfaces: InterfaceReflections,
    Types: TypeAliasReflections,
  });
}
