import { readFileSync, readdirSync, lstatSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { publicFiles, roots, rootFiles } from "./public-files.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const files = publicFiles(root);
const problems = [];
const generated = new Set([
  ".git",
  "node_modules",
  "dist",
  "open-pathway-source.tgz",
]);
for (const name of readdirSync(root)) {
  if (
    !roots.includes(name) &&
    !rootFiles.includes(name) &&
    !generated.has(name)
  )
    problems.push(`Unreviewed root entry: ${name}`);
}
const secretPatterns = [
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /gh[pousr]_[A-Za-z0-9]{30,}/,
  /github_pat_[A-Za-z0-9_]{40,}/,
  /AKIA[0-9A-Z]{16}/,
  /(?:sk|xoxb|xoxp)-[A-Za-z0-9-]{24,}/,
  /[A-Za-z]:[\\/](?:Users|Documents|Desktop)[\\/]/i,
];
for (const relative of files) {
  const file = path.join(root, relative);
  if (lstatSync(file).isSymbolicLink()) {
    problems.push(`Symlink: ${relative}`);
    continue;
  }
  if (
    /(?:\.env|\.pem|\.key|\.docx|\.pdf|\.png|\.jpe?g|\.webp|\.csv|\.sqlite|\.log)$/i.test(
      relative,
    )
  )
    problems.push(`Private or unreviewed binary/data file: ${relative}`);
  const source = readFileSync(file, "utf8");
  if (source.includes("\u0000")) problems.push(`Binary data: ${relative}`);
  if (secretPatterns.some((pattern) => pattern.test(source)))
    problems.push(`Potential secret or local path: ${relative}`);
  if (
    relative.startsWith("src/") &&
    /(?:\bfetch\s*\(|XMLHttpRequest|sendBeacon|\bWebSocket\s*\(|mailto:|tel:|https?:\/\/)/.test(
      source,
    ) &&
    relative !== "src/siteLanguage.js"
  )
    problems.push(`Network/contact reference in app source: ${relative}`);
  if (
    relative.endsWith(".svg") &&
    /<(?:script|foreignObject|image)\b|(?:href|onload|onclick)\s*=/i.test(
      source,
    )
  )
    problems.push(`External or executable SVG content: ${relative}`);
}
if (existsSync(path.join(root, ".git"))) {
  const tracked = execFileSync("git", ["ls-files", "-z"], {
    cwd: root,
    encoding: "utf8",
  })
    .split("\0")
    .filter(Boolean);
  for (const file of tracked)
    if (!files.includes(file))
      problems.push(`Unapproved tracked file: ${file}`);
}
if (problems.length) {
  console.error(problems.join("\n"));
  process.exitCode = 1;
} else
  console.log(
    `Public audit passed: ${files.length} allowlisted source files; no flagged credentials, private files, app network calls, or unapproved tracked files. Review new content and asset rights separately.`,
  );
