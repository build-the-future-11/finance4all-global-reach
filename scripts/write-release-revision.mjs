import { existsSync, writeFileSync } from "node:fs";

import { resolveReleaseRevision } from "./release-revision.mjs";

if (!existsSync("dist")) {
  throw new Error("release revision writer requires an existing dist directory");
}

const revision = resolveReleaseRevision();
writeFileSync(
  "dist/release-revision.json",
  `${JSON.stringify({ service: "financemeta-member-portal", revision })}\n`,
  "utf8",
);
console.log(`Wrote immutable portal release revision ${revision}`);
