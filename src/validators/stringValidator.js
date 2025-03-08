import hasValue from "./hasValueValidator.js";

export default function validate(option) {
  if(!hasValue(option)) {
    return false;
  }

  const [, value] = option;

  return typeof value === "string";
}
