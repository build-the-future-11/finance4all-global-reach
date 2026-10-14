import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("portfolio link", () => {
  it("links FinanceMeta to the live BU1LD research network without changing product identity", () => {
    const landing = readFileSync("src/pages/Index.tsx", "utf8");
    const labs = readFileSync("src/pages/portal/labs/MetaLabs.tsx", "utf8");

    expect(landing).toContain('href="https://thebu1ld.com/network"');
    expect(landing).toContain('href="https://finance-meta-landing.vercel.app/"');
    expect(landing).toContain('to="/iyern"');
    expect(landing).toContain('"https://finance-meta-landing.vercel.app/projects"');
    expect(landing).toContain("Browse all 48 project records");
    expect(landing).toContain("All project pages");
    expect(landing).toContain("Portfolio map");
    expect(landing).toContain("Educational content, not personal financial advice.");
    expect(labs).toContain("https://finance-meta-landing.vercel.app/projects");
    expect(labs).toContain("All 48 project records");
  });
});
