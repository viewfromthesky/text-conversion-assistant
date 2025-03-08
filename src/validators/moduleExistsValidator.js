import { resolve } from "node:path";
import { readFileSync } from "node:fs";
import hasValue from "./hasValueValidator.js";

export default function validate(option) {
  if (!hasValue(option)) return false;

  const [, moduleName] = option;

  // This isn't a good way to handle the base path of the project
  // TODO: Fix this with an option or something
  const moduleAbsPath = resolve(`./src/modules/${moduleName}/index.js`);

  console.log(moduleAbsPath);

  try {
    return !!readFileSync(moduleAbsPath);
  } catch(e) {
    return false;
  }
}
