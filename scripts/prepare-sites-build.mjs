#!/usr/bin/env node
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const index = path.join(dist, "client", "index.html");
const worker = path.join(root, "worker", "index.js");
const hosting = path.join(root, ".openai", "hosting.json");

for (const file of [index, worker, hosting]) {
  if (!existsSync(file)) throw new Error("Missing Sites build input: " + file);
}

mkdirSync(path.join(dist, "server"), { recursive: true });
mkdirSync(path.join(dist, ".openai"), { recursive: true });
copyFileSync(worker, path.join(dist, "server", "index.js"));
copyFileSync(hosting, path.join(dist, ".openai", "hosting.json"));

const licenses = path.join(dist, "client", "licenses");
mkdirSync(licenses, { recursive: true });
for (const name of [
  "react",
  "react-dom",
  "@phosphor-icons/react",
  "@fontsource/noto-sans-tc",
  "@fontsource/noto-serif-tc",
  "@fontsource/cormorant-garamond",
]) {
  copyFileSync(
    path.join(root, "node_modules", name, "LICENSE"),
    path.join(licenses, `${name.replaceAll("/", "-").replaceAll("@", "")}.txt`),
  );
}
copyFileSync(
  path.join(root, "LICENSE"),
  path.join(licenses, "open-pathway.txt"),
);
copyFileSync(
  path.join(root, "THIRD_PARTY_NOTICES.md"),
  path.join(licenses, "THIRD_PARTY_NOTICES.md"),
);

console.log(
  "Prepared Sites build: dist/server/index.js and dist/.openai/hosting.json",
);
