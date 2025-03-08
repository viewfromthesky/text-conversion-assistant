import { Parser as XMLParser } from "xml2js";
import { readFile } from "node:fs/promises";

/**
*
* @param {*} fileHandle
* @param {ParserOptions} opts
*/
export default async function parse(fileHandle, opts = {}) {
  try {
    const inputFile = await readFile(fileHandle, "utf8");

    const parser = new XMLParser();
    const parsedContent = await parser.parseStringPromise(inputFile);

    if(!opts.simplify) {
      return parsedContent;
    }

    return simplifyContent(parsedContent);
  } catch(e) {
    console.error(e);

    return undefined;
  }
}
