import hasValue from './hasValueValidator.js';

export default function validate(option) {
  if(!hasValue(option)) return false;

  const [, filePath] = option;

  return typeof filePath === "string";
}
