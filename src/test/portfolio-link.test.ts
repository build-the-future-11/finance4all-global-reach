import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("portfolio link", () => {
  it("keeps canonical research routes local and identifies the separate FinanceMeta source", () => {
    const landing = readFileSync("src/pages/Index.tsx", "utf8");
    const labs = readFileSync("src/pages/portal/labs/MetaLabs.tsx", "utf8");
    const layout = readFileSync("src/layouts/PublicLayout.tsx", "utf8");

    expect(layout).toContain('href="https://finance-meta-landing.vercel.app/"');
    expect(landing).toContain('to="/iyern"');
    expect(landing).toContain('PROJECT_DIRECTORY_URL = "/research"');
    expect(landing).toContain('RESEARCH_PROJECT_DIRECTORY_URL = "/research/projects"');
    expect(landing).toContain("Explore the research directory");
    expect(layout).toContain("Educational content, not personal financial advice.");
    expect(labs).toContain("https://finance-meta-landing.vercel.app/projects");
    expect(labs).toContain("FinanceMeta portfolio register");
    expect(labs).toContain("<Link to={project.page}");
  });
});
