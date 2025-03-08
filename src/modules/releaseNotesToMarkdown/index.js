import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import parseArguments from "../../parsers/argumentParser/index.js";
import isString from "../../validators/stringValidator.js";
import isWeekNumber from "../../validators/weekNumberValidator.js";
import { GLOBAL_ARGS } from "../../parsers/argumentParser/knownArguments.js";
import { Parser as XMLParser } from "xml2js";

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
    // TODO: convert to "isOption" validator, test against known values instead
    // of accepting anything string-like
    validate: isString
  }
};

function findSelectionByWeekNumber(bodyJsonArr, weekNo = 0) {
  // No narrowing to do
  if(!weekNo) {
    return bodyJsonArr;
  }

  const idxMap = bodyJsonArr?.reduce((map, outerEl, bodyIdx) => {
    outerEl?.ul?.some((innerEl, ulIdx) => {
      return innerEl?.li?.some((listItem, liIdx) => {
        if(listItem?.p?.includes(`Week ${weekNo}`)) {
          map.bodyIdx = bodyIdx;
          map.ulIdx = ulIdx;
          map.liIdx = liIdx;

          return true;
        }
      });
    });

    return map;
  }, {
    bodyIdx: 0,
    ulIdx: 0,
    liIdx: 0
  });

  return bodyJsonArr[idxMap.bodyIdx]?.ul[idxMap.ulIdx]?.li[idxMap.liIdx];
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

  console.log("Attempting selection with criteria:", weekNo, versionNos);

  if(!Array.isArray(inputJson.html.body)) {
    return undefined;
  }

  const { body } = inputJson.html;

  const weekSelection = findSelectionByWeekNumber(body, weekNo);

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

  try {
    const inputFileHandle = await argMap.inputFile();
    const inputFile = await readFile(inputFileHandle, "utf8");

    const parser = new XMLParser();
    const parsedContent = await parser.parseStringPromise(inputFile);

    if(!parsedContent) {
      return 102;
    }

    const selection = getDesiredSelection(
      parsedContent,
      argMap.weekNumber,
      argMap.versions
    );

    console.log("selection:", selection);

    if(!selection) {
      console.error("Failed to get selection based on criteria.")
      return 103;
    }

    const outputPath = resolve(argMap.outputPath);
    await writeFile(outputPath, JSON.stringify(selection, undefined, 2));
  } catch(e) {
    console.error(e);

    // Return codes 100-199 for this module, can use generic 0-99 as well.
    return 101;
  }

  return 0;
}
