import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

// Titles are already present in the user-supplied inventory. No private draft
// prose, source snapshot or credentials are embedded in this public guard.
const heldTitles = [
  "Why lower inflation does not mean lower prices",
  "Why bond prices fall when yields rise",
  "How a profitable company can run short of cash",
  "What a weaker currency changes",
  "A stock split does not make a company cheaper",
  "Why a rising stock index is not the whole economy",
  "Before the Backtest: What Makes Historical Market Data Point-in-Time Safe?",
];

async function files(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(entry => entry.isDirectory() ? files(path.join(directory, entry.name)) : [path.join(directory, entry.name)]));
  return nested.flat();
}

const root = process.cwd();
const sources = await files(path.join(root, "src"));
for (const file of sources.filter(file => /\.[jt]sx?$/.test(file) && !file.includes(`${path.sep}test${path.sep}`))) {
  const text = await readFile(file, "utf8");
  if (/(?:from\s*|import\s*\()\s*["'][^"']*editorial-series(?:\.ts)?["']/.test(text)) {
    throw new Error(`Unapproved editorial-series import in ${path.relative(root, file)}.`);
  }
}

const outputs = await files(path.join(root, "dist"));
if (!outputs.some(file => file.endsWith("index.html"))) throw new Error("Build output is missing. Build before checking editorial isolation.");
for (const file of outputs) {
  const relative = path.relative(root, file);
  if (/editorial-review|issue-001-draft|editorial-series/.test(relative)) throw new Error(`Restricted editorial artifact in build output: ${relative}.`);
  if (!/\.(?:js|html|json|css|map)$/.test(file)) continue;
  const text = await readFile(file, "utf8");
  if (heldTitles.some(title => text.includes(title)) || text.includes("issue-001-draft.json")) {
    throw new Error(`Unapproved editorial content in ${relative}.`);
  }
}
console.log("Editorial isolation passed: no held manuscript imports, draft titles or private import artifacts in dist.");
