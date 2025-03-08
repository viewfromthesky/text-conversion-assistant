import { validateArgumentMap } from "./knownArguments.js";

const FLAG_REGEXP = /-{1,2}[a-zA-Z\-]+/;

/**
 * @param {string} flag
 * @returns {string}
 */
function removeFlagPrefix(flag) {
  if(!FLAG_REGEXP.test(flag)) {
    // Nothing to do
    return flag;
  }

  // This is a very dumb check and assumes that a "short" prefix is ALWAYS 2
  // characters, i.e. "-o", which may not be true. Or is it a design choice?
  return flag.length > 2 ?
    flag.substring(2) :
    flag.substring(1);
}

function getOptionKey(argumentName, validArgMap) {
  const flag = removeFlagPrefix(argumentName);
  const found = Object.entries(validArgMap).find(
    ([, config]) => (config.short === flag || config.long === flag)
  );

  if(found) {
    return found[0];
  }

  return undefined;
}

/**
 * @param {Array<string>} args
 * @returns {Array<string, [string, string]>}
 */
function mapArgumentGroups(args, validArgMap) {
  if(!args || !Array.isArray(args)) {
    return undefined;
  }

  /** @type {Array<string, [string, string]>} */
  const groups = [];
  /** @type {number} */
  let groupLimit;

  for (let i = args.length - 1; i >= 0; i--) {
    // This is an option name, test it to see what we should do
    if (!FLAG_REGEXP.test(args[i])) {
      continue;
    }

    const optionKey = getOptionKey(args[i], validArgMap);

    // if (!optionKey) {
    //   continue;
    // }

    groups.push([optionKey, args.slice(i, groupLimit)]);

    groupLimit = i;
  }

  return groups;
}

/**
 * Test all option groups and return the combined result of the tests. If one
 * option group does not pass validation, the tests automatically fail.
 *
 * @param {Array<string, [string, string]>} optionMap
 * @returns {boolean} "true" if all tests pass, "false" if any of them don't.
 */
function validateOptionGroups(optionMap, validArgMap) {
  // Return early if any of the tests do not pass
  return !(optionMap.some(([key, val]) => {
    // This isn't matched, so essentially doesn't need to work now.
    // Expectation is this will be passed into a module and then be tested
    // before it's used.
    if(!key) {
      return false;
    }

    const valid = validArgMap[key].validate(val);

    // Quick warning for the user, only place this happens
    if(!valid) {
      console.error(`Invalid value for option "${key}"`);
    }

    // Give me an answer to the question:
    // "Does an option group NOT pass validation?"
    return !valid;
  }));
}

/**
 * @param {Array<string>} args
 */
export default function parseArguments(args, validArgMap) {
  if(!validateArgumentMap(validArgMap)) {
    console.error("parseArguments: Cannot test against argument map.");
    return undefined;
  }

  const optionMap = mapArgumentGroups(args, validArgMap);
  const valid = validateOptionGroups(optionMap, validArgMap);

  if(!valid) {
    return undefined;
  }

  return optionMap.reduce(
    (inputMap, [key, val]) => {
      const option = validArgMap[key];

      if(option && typeof option.parse === "function") {
        inputMap[key] = option.parse(val);
      }

      return inputMap;
    },
    {}
  )
}
