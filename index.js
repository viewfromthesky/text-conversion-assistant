// import { XMLParser } from "xml2js";
import { argv } from "node:process";
import { readFile } from "node:fs/promises";
import parseArguments from "./src/parsers/argumentParser/index.js";
import { ROOT } from "./src/parsers/argumentParser/knownArguments.js";

async function main() {
  const args = argv.slice(2);

  if(!args.length) {
    return 1;
  }

  const parsedArgs = parseArguments(args, ROOT);

  if(!parsedArgs) {
    return 2;
  }

  Object.entries(parsedArgs).forEach(([key, getValue]) => {
    try {
      if(getValue && typeof getValue === "function") {
        getValue().then(async (result) => {
          const content = await readFile(result, { encoding: "utf8" });
          console.log(`${key}: ${content}`);
        }, (error) => {
          console.error(error);
        });
      }
    } catch (e) {
      console.error(e);
    }
  });

  return 0;
}

main().then(
  (result) => {
    return result;
  },
  (error) => {
    console.error(error);
    return error;
  },
);
