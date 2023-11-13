import TypeDoc from "typedoc";
import FlagsNode from "./FlagsNode.js";
import CommentNode from "./CommentNode.js";
import PropertyNode from "./PropertyNode.js";
import MethodNode from "./MethodNode.js";
import { SourceLinkDefinedInNode } from "./SourceLinkNode.js";
import SignatureNode from "./SignatureNode.js";

/**
 * Markdown of a class reflection.
 */
export default function ClassNode(
  reflection: TypeDoc.Models.DeclarationReflection
): string {
  const Properties = reflection.getChildrenByKind(
    TypeDoc.Models.ReflectionKind.Property
  );
  const Methods = reflection.getChildrenByKind(
    TypeDoc.Models.ReflectionKind.Method
  );
  const Constructors = reflection.getChildrenByKind(
    TypeDoc.Models.ReflectionKind.Constructor
  );

  return `# ${reflection.name} ${FlagsNode(
    reflection.flags,
    reflection.comment
  )}
  ${SourceLinkDefinedInNode(reflection)}  
  ${
    reflection.comment
      ? `
${CommentNode(reflection.comment)}
  `
      : "" // end of comment node
  }


${
  Constructors.length > 0
    ? `## Constructors\n\n${Constructors.map(
        (x) => `### ${x.name}\n${x.signatures?.map((s) => SignatureNode(s))}`
      ).join("\n---\n")}`
    : "" // End of properties node
}

${
  Properties.length > 0
    ? `## Properties\n\n${Properties.map((x) => PropertyNode(x)).join(
        "\n---\n"
      )}`
    : "" // End of properties node
}

${
  Methods.length > 0
    ? `## Methods\n\n${Methods.map((x) => MethodNode(x)).join("\n---\n")}`
    : "" // End of properties node
}

  `; // end of entire class node
}
