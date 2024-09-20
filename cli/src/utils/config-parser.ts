import fs from "fs";
import path from "path";

/**
 * Parses the provided `.vitepress/config.js` configuration specified by the user.
 * Since docdocs uses that same config.js file internal, this function is responsible for creating
 * a "read-able" version to merge both configs together
 */
export function ParseVitePressConfig(buildDirectory: string) {
  const vitepressConfigOutput = path.join(
    process.cwd(),
    ".vitepress",
    "config.js"
  );
  if (!fs.existsSync(vitepressConfigOutput)) {
    return;
  }
  const readFile = fs.readFileSync(vitepressConfigOutput, "utf-8");

  //   const exportRegex = /export default {(((.|\n)*))}/gm;
  const t = "export 4";
  const exportRegex = /export default {(\d+)/;
  const m = t.match(exportRegex);
  console.log(m);

  //   console.log(exportcontent);
}
