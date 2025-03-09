import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import parseArguments from "../../parsers/argumentParser/index.js";
import parseBikeFile from "../../parsers/bikeXMLParser/index.js";
import isString from "../../validators/stringValidator.js";
import isWeekNumber from "../../validators/weekNumberValidator.js";
import { GLOBAL_ARGS } from "../../parsers/argumentParser/knownArguments.js";
import parseToBasicSchema from "./releaseNotesParser.js";
import convertToMd from "./notesDataToMd.js";

const KNOWN_ARGUMENTS = {
  ...GLOBAL_ARGS,
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
  weekNumber: {
    short: "w",
    long: "week",
    /**
     * @param {[string, string]} param0
     * @returns {number}
     */
    parse: ([, weekNo]) => Number.parseInt(weekNo, 10),
    validate: isWeekNumber
  },
  dialect: {
    short: "d",
    long: "dialect",
    parse: ([, value]) => value,
    validate: (option) => {
      const DIALECT_OPTIONS = ["default", "slack"];
      if(!isString(option)) {
        return false;
      } else if(!DIALECT_OPTIONS.includes(option[1])) {
        console.error(`Unknown value for dialect. Available choices are ${
          DIALECT_OPTIONS.join(", ")
        }`);

        return false;
      }

      return true;
    }
  }
};

/**
 * @param {Object} content
 * @param {string | RegExp} rootNodeTextContent
 * @returns
 */
function findListByRootNode(content, rootNodeComparison) {
  if(typeof content !== "object" || !rootNodeComparison) {
    return undefined;
  }

  const idxMap = content?.ul?.reduce((map, innerEl, ulIdx) => {
    innerEl?.li?.some((listItem, liIdx) => {
      const found = rootNodeComparison instanceof RegExp ?
        listItem?.p?.some((pContent) => {
          return rootNodeComparison.test(pContent);
        }) :
        listItem?.p?.includes(rootNodeComparison);

      if (found) {
        map.ulIdx = ulIdx;
        map.liIdx = liIdx;

        return true;
      }
    });

    return map;
  }, {
    ulIdx: undefined,
    liIdx: undefined
  });

  // Nothing was found
  if(
    // idxMap may be undefined if the search elements (ul/li) aren't present
    // at the root of the provided node
    !idxMap ||
    Object.values(idxMap).some((idx) => typeof idx === "undefined")
  ) {
    console.error(`Unable to locate root node based on comparison "${
      rootNodeComparison
    }"`);

    return undefined;
  }

  return content.ul[idxMap.ulIdx].li[idxMap.liIdx];
}

/**
 * @param {Object} inputJson
 * @param {number} weekNo
 * @param {Array<string>} versionNos
 * @returns
 */
function getDesiredSelection(inputJson, weekNo = 0, versionNos = []) {
  if(
      !inputJson ||
      typeof inputJson !== "object" ||
      !inputJson?.html?.body
    ) {
    console.error("Input data is malformed.")

    return undefined;
  }

  if(
    (
      typeof weekNo !== "number" ||
      !weekNo
    ) &&
    (
      !Array.isArray(versionNos) ||
      versionNos.length === 0
    )
  ) {
    console.error("Missing selection criteria.");

    return undefined;
  }

  if(!Array.isArray(inputJson.html.body)) {
    return undefined;
  }

  const { body } = inputJson.html;

  // body is assumed to contain only one element in its array
  // Bike files always comprise a top-level "ul". HTML files might not, but this
  // is not a generic searching function... yet.
  const weekSelection = findListByRootNode(body[0], `Week ${weekNo}`);

  if(!weekSelection) {
    console.error(`Could not find week ${weekNo}. Try another week number.`);

    return undefined;
  }

  if(versionNos.length === 0 || !weekSelection?.ul) {
    return weekSelection;
  }

  const versionSelection = versionNos.reduce((versionArr, version) => {
    const versionContent = findListByRootNode(weekSelection, version);

    if(versionContent) {
      versionArr.push(versionContent);
    }

    return versionArr;
  }, []);

  // Replace ul content with only the selection
  weekSelection.ul.length = 0;
  weekSelection.ul = [{
    li: versionSelection
  }];

  return weekSelection;
}

/**
 * @typedef {Object} ArgMap
 * @property {function} inputFile
 * @property {string} outputPath
 * @property {number} weekNumber
 * @property {Array<string>} versions
 * @property {string} dialect
 *
 */

/**
 * @param {Array<string, [string, string]>} args
 * @returns {number}
 */
export default async function execute(args) {
  /** @type {ArgMap} */
  const argMap = parseArguments(args, KNOWN_ARGUMENTS);

  if(!argMap) {
    return 2;
  }

  if(!argMap.outputPath) {
    console.error("No output path specified. Module cannot continue.")

    return 104;
  }

  try {
    const inputFileHandle = await argMap.inputFile();

    const fileContent = await parseBikeFile(inputFileHandle);

    if(!fileContent) {
      return 102;
    }

    const selection = getDesiredSelection(
      fileContent,
      argMap.weekNumber,
      argMap.versions
    );

    if(!selection) {
      console.error("Failed to get selection based on criteria.")
      return 103;
    }

    const notesData = parseToBasicSchema(selection);
    const markdownNotes = convertToMd(notesData, argMap.dialect);

    const outputPath = resolve(argMap.outputPath);
    await writeFile(outputPath, markdownNotes);
  } catch(e) {
    console.error(e);

    // Return codes 100-199 for this module, can use generic 0-99 as well.
    return 101;
  }

  return 0;
}
