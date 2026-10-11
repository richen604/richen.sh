import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { runCLI } from "../src/blog/art/converter.ts";
export { convert, serialize, CONVERTER } from "../src/blog/art/converter.ts";

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  runCLI().catch((error: unknown) => { console.error(error); process.exitCode = 1; });
}
