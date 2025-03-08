/**
 * @param {[string, string | undefined]} option
 * @returns {boolean}
 */
export default function validate(option) {
  if(!option || !Array.isArray(option) || option.length !== 2) {
    return false;
  }

  return true;
}
