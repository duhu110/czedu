import { mkdir, rm, writeFile } from "fs/promises";
import { join } from "path";
import { describe, expect, it } from "vitest";

import { createUploadedImageResponse } from "@/lib/uploaded-image-response";

describe("createUploadedImageResponse", () => {
  it("serves an uploaded jpeg from disk with an image content type", async () => {
    const rootDir = join(process.cwd(), "public", "uploads");
    const fileName = `__route-test-${Date.now()}.jpg`;
    const filePath = join(rootDir, fileName);
    await mkdir(rootDir, { recursive: true });

    try {
      const fileBytes = Buffer.from([0xff, 0xd8, 0xff, 0xdb, 0x00, 0x43]);
      await writeFile(filePath, fileBytes);

      const response = await createUploadedImageResponse([fileName]);

      expect(response.status).toBe(200);
      expect(response.headers.get("Content-Type")).toBe("image/jpeg");
      expect(Buffer.from(await response.arrayBuffer())).toEqual(fileBytes);
    } finally {
      await rm(filePath, { force: true });
    }
  });

  it("rejects path traversal outside the upload directory", async () => {
    const response = await createUploadedImageResponse(["..", "secret.jpg"]);

    expect(response.status).toBe(400);
  });

  it("returns 404 when an uploaded image does not exist", async () => {
    const response = await createUploadedImageResponse(["missing.jpg"]);

    expect(response.status).toBe(404);
  });
});
