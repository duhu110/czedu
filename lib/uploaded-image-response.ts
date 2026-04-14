import { readFile } from "fs/promises";
import { extname, join } from "path";

const DEFAULT_UPLOAD_ROOT = join(
  /*turbopackIgnore: true*/ process.cwd(),
  "public",
  "uploads",
);

const IMAGE_CONTENT_TYPES: Record<string, string> = {
  ".avif": "image/avif",
  ".bmp": "image/bmp",
  ".gif": "image/gif",
  ".heic": "image/heic",
  ".heif": "image/heif",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".tif": "image/tiff",
  ".tiff": "image/tiff",
  ".webp": "image/webp",
};

function resolveUploadedImagePath(segments: string[]) {
  if (
    segments.length === 0 ||
    segments.some(
      (segment) =>
        !segment || segment === "." || segment === ".." || /[\\/]/.test(segment),
    )
  ) {
    return null;
  }

  return join(DEFAULT_UPLOAD_ROOT, ...segments);
}

export async function createUploadedImageResponse(segments: string[]) {
  const filePath = resolveUploadedImagePath(segments);

  if (!filePath) {
    return new Response("Invalid upload path", { status: 400 });
  }

  try {
    const file = await readFile(filePath);
    const contentType =
      IMAGE_CONTENT_TYPES[extname(filePath).toLowerCase()] ??
      "application/octet-stream";

    return new Response(new Uint8Array(file), {
      status: 200,
      headers: {
        "Cache-Control": "public, max-age=0, must-revalidate",
        "Content-Type": contentType,
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      return new Response("Uploaded image not found", { status: 404 });
    }

    throw error;
  }
}
