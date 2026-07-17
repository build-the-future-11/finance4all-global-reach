#!/usr/bin/env node
/**
 * Package source for delivery without secrets or local tooling caches.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outDir = path.join(root, "dist-packages");
const outFile = path.join(outDir, "finance4all-finished-source.tgz");

fs.mkdirSync(outDir, { recursive: true });
if (fs.existsSync(outFile)) fs.unlinkSync(outFile);

const excludes = [
  "node_modules",
  "dist",
  "coverage",
  "test-results",
  "playwright-report",
  ".git",
  "dist-packages",
  ".env",
  ".env.local",
  ".env.production",
  ".env.development",
  ".vercel",
  ".cursor",
  ".DS_Store",
  "*.log",
];

const args = ["-czf", outFile, ...excludes.flatMap((e) => ["--exclude", e]), "."];
const result = spawnSync("tar", args, { cwd: root, encoding: "utf8" });
if (result.status !== 0) {
  console.error(result.stderr || result.stdout || "tar failed");
  process.exit(result.status ?? 1);
}

const list = spawnSync("tar", ["-tzf", outFile], { encoding: "utf8" });
const entries = (list.stdout || "").split("\n").filter(Boolean);
const secretHits = entries.filter((e) => {
  const base = e.replace(/^\.\//, "");
  return (
    base === ".env" ||
    /^\.env\.(local|production|development)$/.test(base) ||
    base.startsWith(".vercel/") ||
    base.startsWith(".cursor/")
  );
});
if (secretHits.length) {
  console.error("Refusing to ship secrets/tooling caches:", secretHits.slice(0, 20));
  fs.unlinkSync(outFile);
  process.exit(1);
}

console.log(`Wrote ${path.relative(root, outFile)} (${entries.length} entries)`);
