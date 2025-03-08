import isInteger from "./stringShouldBeIntegerValidator.js";

/**
 * @param {[string, string]} option
 * @returns {boolean}
 */
export default function validate(option) {
  if(!isInteger(option)) {
    return false;
  }

  const [, weekNumberStr] = option;
  const weekNumber = Number.parseInt(weekNumberStr, 10);

  return weekNumber > 0 && weekNumber < 53;
}
