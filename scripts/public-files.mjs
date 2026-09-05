import { readdirSync, statSync } from "node:fs";
import path from "node:path";

export const roots = [
  "src",
  "public",
  "tests",
  "scripts",
  "worker",
  ".openai",
  ".github",
];
export const rootFiles = [
  ".gitignore",
  "AGENTS.md",
  "README.md",
  "LICENSE",
  "THIRD_PARTY_NOTICES.md",
  "CONTRIBUTING.md",
  "SECURITY.md",
  "package.json",
  "package-lock.json",
  "index.html",
  "vite.config.mjs",
  "vercel.json",
];
export function publicFiles(root) {
  const files = [...rootFiles];
  function walk(relative) {
    for (const item of readdirSync(path.join(root, relative), {
      withFileTypes: true,
    })) {
      const name = `${relative}/${item.name}`;
      if (item.isSymbolicLink())
        throw new Error(`Symlink is not allowed in public sources: ${name}`);
      if (item.isDirectory()) walk(name);
      else if (item.isFile()) files.push(name);
      else throw new Error(`Unsupported file: ${name}`);
    }
  }
  for (const folder of roots) walk(folder);
  for (const file of rootFiles)
    if (!statSync(path.join(root, file)).isFile())
      throw new Error(`Missing release file: ${file}`);
  return files.sort();
}
