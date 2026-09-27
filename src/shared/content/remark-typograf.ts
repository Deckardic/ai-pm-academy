import type { Root } from "mdast";
import { visit } from "unist-util-visit";
import { typo } from "./typograf";

/** Applies Russian typography to prose text nodes; code stays untouched. */
export function remarkTypograf() {
  return (tree: Root) => {
    visit(tree, "text", (node) => {
      node.value = typo(node.value);
    });
  };
}
