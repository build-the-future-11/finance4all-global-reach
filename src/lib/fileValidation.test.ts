import { describe, it, expect } from "vitest";
import { validateImageFile, MAX_AVATAR_BYTES } from "@/lib/fileValidation";

function makeFile(bytes: number[], name: string, type: string): File {
  const buffer = new Uint8Array(bytes);
  return new File([buffer], name, { type });
}

describe("fileValidation", () => {
  it("accepts valid JPEG files", async () => {
    const file = makeFile([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0], "photo.jpg", "image/jpeg");
    const result = await validateImageFile(file);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.mime).toBe("image/jpeg");
      expect(result.ext).toBe("jpg");
    }
  });

  it("rejects mismatched MIME and content", async () => {
    const file = makeFile([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0], "photo.png", "image/png");
    const result = await validateImageFile(file);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("does not match");
  });

  it("rejects oversized files", async () => {
    const file = makeFile([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0], "big.jpg", "image/jpeg");
    Object.defineProperty(file, "size", { value: MAX_AVATAR_BYTES + 1 });
    const result = await validateImageFile(file);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("2 MB");
  });

  it("rejects unsupported extensions", async () => {
    const file = makeFile([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0], "photo.svg", "image/jpeg");
    const result = await validateImageFile(file);
    expect(result.ok).toBe(false);
  });
});
