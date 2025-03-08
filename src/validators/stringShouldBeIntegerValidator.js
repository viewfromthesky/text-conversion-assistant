import isString from "./stringValidator.js";

export default function validate(option) {
  if(!isString) {
    return false;
  }

  const [, value] = option;
  const num = Number.parseInt(value, 10);

  if (Number.isNaN(num) || value.length !== `${num}`.length) {
    return false;
  }

  return true;
}
