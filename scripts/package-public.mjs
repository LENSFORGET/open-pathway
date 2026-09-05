import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { publicFiles } from "./public-files.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const files = publicFiles(root);
const archive = "open-pathway-source.tgz";
execFileSync("tar", ["-czf", archive, "--", ...files], {
  cwd: root,
  stdio: "inherit",
});
const entries = execFileSync("tar", ["-tzf", archive], {
  cwd: root,
  encoding: "utf8",
})
  .trim()
  .split(/\r?\n/)
  .sort();
if (JSON.stringify(entries) !== JSON.stringify(files))
  throw new Error("Archive manifest does not match public file allowlist");
console.log(
  `Created and verified ${archive}: ${files.length} source files, no Git history or local dependencies.`,
);
