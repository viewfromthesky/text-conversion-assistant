import parseArguments from "../../parsers/argumentParser/index.js";
import isString from "../../validators/stringValidator.js";
import isInteger from "../../validators/stringShouldBeIntegerValidator.js";

const KNOWN_ARGUMENTS = {
  versions: {
    short: "v",
    long: "versions",
    /**
     * @param {[string, string]} param0
     * @returns {Array<string>}
     */
    parse: ([, value]) => value.split(","),
    validate: isString
  },
  week: {
    short: "w",
    long: "week",
    /**
     * @param {[string, string]} param0
     * @returns {number}
     */
    parse: ([, weekNo]) => Number.parseInt(weekNo, 10),
    validate: isInteger
  },
  dialect: {
    short: "d",
    long: "dialect",
    parse: ([, value]) => value,
    // TODO: convert to "isOption" validator, test against known values instead
    // of accepting anything string-like
    validate: isString
  }
};

export default function execute(args) {
  const argMap = parseArguments(args, KNOWN_ARGUMENTS);

  if(!argMap) {
    return 2;
  }

  return 0;
}
