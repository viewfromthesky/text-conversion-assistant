// import { XMLParser } from "xml2js";
import { argv } from "node:process";
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

  if(!parsedArgs.module) {
    console.error("No instruction given; please provide a module.");
    return 3;
  }

  const execute = (await parsedArgs.module())?.default;

  if(!execute || typeof execute !== "function") {
    console.error("Invalid module provided. Make sure the module's default export is a function.")
    return 4;
  }

  return execute(args);
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
