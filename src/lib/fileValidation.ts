/** Client-side image validation before upload (server enforces MIME/size via storage bucket). */

const IMAGE_SIGNATURES: Array<{ mime: string; bytes: number[] }> = [
  { mime: "image/jpeg", bytes: [0xff, 0xd8, 0xff] },
  { mime: "image/png", bytes: [0x89, 0x50, 0x4e, 0x47] },
  { mime: "image/gif", bytes: [0x47, 0x49, 0x46, 0x38] },
  { mime: "image/webp", bytes: [0x52, 0x49, 0x46, 0x46] },
];

const ALLOWED_MIME = new Set(IMAGE_SIGNATURES.map((s) => s.mime));
const ALLOWED_EXT = new Set(["jpg", "jpeg", "png", "webp", "gif"]);

export const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

export type ImageValidationResult =
  | { ok: true; mime: string; ext: string }
  | { ok: false; error: string };

function readHeader(buffer: ArrayBuffer, length: number): number[] {
  return Array.from(new Uint8Array(buffer.slice(0, length)));
}

function detectMime(header: number[]): string | null {
  for (const sig of IMAGE_SIGNATURES) {
    if (sig.bytes.every((b, i) => header[i] === b)) return sig.mime;
  }
  return null;
}

function normalizeExt(filename: string): string | null {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (!ext || !ALLOWED_EXT.has(ext)) return null;
  return ext === "jpeg" ? "jpg" : ext;
}

export async function validateImageFile(file: File, maxBytes = MAX_AVATAR_BYTES): Promise<ImageValidationResult> {
  if (!ALLOWED_MIME.has(file.type)) {
    return { ok: false, error: "Use JPEG, PNG, WebP, or GIF." };
  }
  if (file.size > maxBytes) {
    return { ok: false, error: "Image must be under 2 MB." };
  }
  if (file.size < 4) {
    return { ok: false, error: "File is too small to be a valid image." };
  }

  const ext = normalizeExt(file.name);
  if (!ext) {
    return { ok: false, error: "Use a supported file extension (.jpg, .png, .webp, .gif)." };
  }

  const buffer = await file.arrayBuffer();
  const header = readHeader(buffer, Math.min(12, file.size));
  const detected = detectMime(header);
  if (!detected || detected !== file.type) {
    return { ok: false, error: "File content does not match its type." };
  }

  if (detected === "image/webp") {
    const webpMarker = String.fromCharCode(...header.slice(8, 12));
    if (webpMarker !== "WEBP") {
      return { ok: false, error: "File content does not match its type." };
    }
  }

  return { ok: true, mime: detected, ext };
}
