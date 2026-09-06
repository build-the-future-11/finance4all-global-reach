import { describe, expect, it } from "vitest";
import { readReleaseRevision } from "@/lib/release-revision";

const SHA = "41b30cf333d33373a5900b47aae4d30b91127377";

describe("deployed release revision payload", () => {
  it("reads the production writer's revision field", () => {
    expect(readReleaseRevision({ revision: SHA })).toBe(SHA);
  });

  it("keeps compatibility with sha payloads and rejects mutable identifiers", () => {
    expect(readReleaseRevision({ sha: SHA })).toBe(SHA);
    expect(readReleaseRevision({ revision: "main" })).toBeNull();
    expect(readReleaseRevision(null)).toBeNull();
  });
});
