import fileParser from '../fileParser.js';
import filePathValidator from '../../validators/filePathValidator.js';
import moduleValidator from "../../validators/moduleExistsValidator.js";
import moduleParser from "../moduleParser.js";

export function validateArgumentMap(argMap) {
  if(!argMap || typeof argMap !== "object") {
    return false;
  }

  return !(Object.entries(argMap).some(([key, map]) => {
    return !(
      map.long && typeof map.long === "string" &&
      map.short && typeof map.short === "string" &&
      map.parse && typeof map.parse === "function" &&
      map.validate && typeof map.validate === "function"
    )
  }));
}

export const ROOT = {
  input: {
      long: "input",
      short: "i",
      parse: fileParser,
      validate: filePathValidator
    },
    output: {
      long: "output",
      short: "o",
      parse: fileParser,
      validate: filePathValidator
    },
    module: {
      long: "module",
      short: "m",
      parse: moduleParser,
      validate: moduleValidator
    }
};
