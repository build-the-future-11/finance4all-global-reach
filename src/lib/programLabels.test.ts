import { describe, expect, it } from "vitest";
import { isSampleContent, programKindLabels, stripSamplePrefix } from "@/lib/programLabels";

describe("programLabels", () => {
  it("detects fellowship and competition from tags", () => {
    expect(
      programKindLabels({
        title: "YC-style Fintech Fellowship",
        type: "program",
        tags: ["fintech", "fellowship"],
      }),
    ).toContain("Fellowship");
    expect(
      programKindLabels({ title: "Case Competition", tags: ["competition"] }),
    ).toContain("Competition");
  });

  it("detects workshop from event title", () => {
    expect(programKindLabels({ title: "London Markets 101 Workshop" })).toContain("Workshop");
  });

  it("marks sample titles", () => {
    expect(isSampleContent("[Sample] Fed signals patience")).toBe(true);
    expect(stripSamplePrefix("[Sample] Fed signals patience")).toBe("Fed signals patience");
  });
});
