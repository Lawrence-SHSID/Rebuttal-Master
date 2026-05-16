import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const international = JSON.parse(
  fs.readFileSync(path.join(root, "content", "motions-international.json"), "utf8"),
).motions;
const wsdaImpromptu = JSON.parse(
  fs.readFileSync(
    path.join(root, "content", "wsda-impromptu-parsed.json"),
    "utf8",
  ),
).motions;
const esdp = JSON.parse(
  fs.readFileSync(path.join(root, "content", "esdp-motions-parsed.json"), "utf8"),
).motions;

const seen = new Set();
const motions = [];
for (const m of [...international, ...wsdaImpromptu, ...esdp]) {
  if (seen.has(m.id)) throw new Error(`Duplicate motion id: ${m.id}`);
  seen.add(m.id);
  motions.push(m);
}

const out = {
  version: 3,
  description:
    "Merged: international seed + WSDA impromptu docx + ESDP PDF. Regenerate: npm run content:wsda / npm run content:esdp / node scripts/merge-motions.mjs",
  motions,
};

fs.writeFileSync(
  path.join(root, "content", "motions.json"),
  `${JSON.stringify(out, null, 2)}\n`,
  "utf8",
);
console.log(
  "Wrote content/motions.json:",
  international.length,
  "international +",
  wsdaImpromptu.length,
  "WSDA impromptu +",
  esdp.length,
  "ESDP =",
  motions.length,
);
