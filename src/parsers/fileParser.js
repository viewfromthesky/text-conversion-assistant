import { open } from "node:fs/promises";
/**
 * @param {string} filePath
 */
export default function parse([, filePath]) {
  return async () => {
    return open(filePath);
  };
}
