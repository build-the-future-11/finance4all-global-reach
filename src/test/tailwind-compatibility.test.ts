import { readFileSync } from "node:fs";
import path from "node:path";
import postcss from "postcss";
import tailwindcss from "@tailwindcss/postcss";
import { describe, expect, it } from "vitest";
import { cn } from "@/lib/utils";

describe("Tailwind v4 compatibility", () => {
  it("lets component overrides replace the migrated shadow utility", () => {
    expect(cn("rounded-md shadow-xs", "shadow-lg")).toBe("rounded-md shadow-lg");
  });

  it("merges migrated focus outlines without leaving conflicting utilities", () => {
    expect(cn("focus-visible:outline-hidden", "focus-visible:outline-none")).toBe(
      "focus-visible:outline-none",
    );
  });

  it("compiles the application theme, component surfaces, and animation plugin", async () => {
    const cssPath = path.resolve("src/index.css");
    const result = await postcss([tailwindcss()]).process(readFileSync(cssPath, "utf8"), {
      from: cssPath,
    });

    expect(result.css).not.toMatch(/@(tailwind|theme|utility|plugin)\b/);
    expect(result.css).toContain("--color-background:");
    expect(result.css).toContain(".bg-background");
    expect(result.css).toContain(".glass-card");
    expect(result.css).toContain(".animate-in");
    expect(result.css).toContain("animation-name: enter");
  });
});
