import { describe, it, expect, beforeEach } from "vitest";
import {
  EDUCATION_PROGRESS_STORAGE_KEY,
  readLocalEducationProgress,
  toggleLocalEducationProgress,
  isMissingTableError,
} from "@/lib/educationProgressStorage";

describe("educationProgressStorage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("reads and writes local lesson progress", () => {
    expect(readLocalEducationProgress().size).toBe(0);
    const next = toggleLocalEducationProgress("lesson-1");
    expect(next.has("lesson-1")).toBe(true);
    expect(readLocalEducationProgress().has("lesson-1")).toBe(true);
    toggleLocalEducationProgress("lesson-1");
    expect(readLocalEducationProgress().has("lesson-1")).toBe(false);
  });

  it("detects missing table errors", () => {
    expect(isMissingTableError({ code: "42P01" })).toBe(true);
    expect(isMissingTableError({ message: 'relation "foo" does not exist' })).toBe(true);
    expect(isMissingTableError({ code: "PGRST116" })).toBe(false);
  });

  it("uses the expected storage key", () => {
    toggleLocalEducationProgress("lesson-a");
    expect(localStorage.getItem(EDUCATION_PROGRESS_STORAGE_KEY)).toContain("lesson-a");
  });
});
