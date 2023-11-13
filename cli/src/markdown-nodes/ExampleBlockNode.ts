// import TypeDoc from "typedoc";

// /**
//  * Markdown of an example block node, fetched from the comment model.
//  */
// export default function ExampleBlockNode(
//   Comment: TypeDoc.Models.Comment | undefined
// ): string | undefined {
//   if (!Comment) {
//     return;
//   }
//   const exampleBlocks = Comment.blockTags.map((x) =>
//     x.tag === "@example" ? x : null
//   );
//   if (exampleBlocks.length > 0) {
//     return `
// ::: details Example${exampleBlocks.length > 1 ? "s" : ""}
// ${exampleBlocks
//   .map((x) => x?.content.map((x) => x.text).join("\n"))
//   .join("\n\n---\n\n")}
// :::`;
//   }
// }
