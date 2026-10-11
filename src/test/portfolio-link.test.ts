import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("portfolio link", () => {
  it("links FinanceMeta to the live BU1LD research network without changing product identity", () => {
    const landing = readFileSync("src/pages/Index.tsx", "utf8");

    expect(landing).toContain('href="https://thebu1ld.com/network"');
    expect(landing).toContain('href="https://finance-meta-landing.vercel.app/"');
    expect(landing).toContain('href="https://iy-ern.vercel.app/"');
    expect(landing).toContain("Portfolio map");
    expect(landing).toContain("Educational content, not personal financial advice.");
  });
});
