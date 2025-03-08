import { resolve } from "node:path";

export default function parse([, moduleName]) {
  const modulePath = resolve(`./src/modules/${moduleName}/index.js`);
  return async () => import(modulePath);
}
