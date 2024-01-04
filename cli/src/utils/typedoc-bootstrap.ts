import TypeDoc, { Converter } from "typedoc";
import { GetDocDocsConfig, LoadDocDocsConfig } from "./core.js";
import { Console } from "@mekstuff/logreport";
import { GetLogForSourceConflict } from "./transpiler.js";

let _CURRENT_TYPEDOC_PROJECT: TypeDoc.ProjectReflection;

export function SetTypeDocProject(project: TypeDoc.ProjectReflection) {
  _CURRENT_TYPEDOC_PROJECT = project;
}
/**
 * Returns the `_CURRENT_TYPEDOC_PROJECT` if any, the `_CURRENT_TYPEDOC_PROJECT` is only made available after `SetTypeDocProject` initiated it
 * for build/serve.
 */
export function GetTypeDocProject(): TypeDoc.ProjectReflection | undefined {
  return _CURRENT_TYPEDOC_PROJECT;
}

/**
 * typedoc-plugin-rename-defaults
 * Source from https://github.com/felipecrs/typedoc-plugin-rename-defaults/blob/master/index.js
 */
function BootstrapPlugin_typedoc_rename_defaults(
  application: TypeDoc.Application
) {
  function handleCreateDeclaration(context: any, reflection: any) {
    if (reflection.name !== "default" && reflection.name !== "export=") {
      return;
    }

    // reflection.escapedName is the cheapest option
    if (
      reflection.escapedName &&
      reflection.escapedName !== "default" &&
      reflection.name !== "export="
    ) {
      reflection.name = reflection.escapedName;
      return;
    }

    // if that does not work, try harder
    const symbol = context.project.getSymbolFromReflection(reflection);
    if (symbol && symbol.declarations && symbol.declarations[0]) {
      /** @type {any} */
      const node = symbol.declarations[0];
      if (node && node.name) {
        reflection.name = node.name.getText();
        return;
      }
    }
    // (docdocs - Don't allow default exports to not explicitly define a name)
    Console.error(
      `Default exports must be exported explicity with a name\n\n${GetLogForSourceConflict(
        [reflection.parent.sources[0]]
      )}\n`
    );

    // Finally, fallback to the file name
    if (reflection.parent && reflection.parent.name) {
      // Removes the folder name
      const name = reflection.parent.name.split("/").pop();
      if (name) {
        // Example: User.entity becomes just User
        reflection.name = name.split(".")[0];
      }
    }
  }
  application.converter.on(
    Converter.EVENT_CREATE_DECLARATION,
    handleCreateDeclaration
  );
}

export default async function BootstrapTypedoc(): Promise<TypeDoc.Application> {
  await LoadDocDocsConfig();
  const DDConfig = GetDocDocsConfig();
  const application = await TypeDoc.Application.bootstrap(
    DDConfig.TypeDocOptions
  );
  BootstrapPlugin_typedoc_rename_defaults(application);
  return application;
}
