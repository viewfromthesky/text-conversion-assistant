function getNode(node) {
  return {
    content: node.p,
    childNodes: node.ul?.[0]?.li?.map((innerNode) => getNode(innerNode))
  };
}

/**
 * @param {Object} rootNode
 * @returns
 */
export default function parse(rootNode) {
  return getNode(rootNode);
}
