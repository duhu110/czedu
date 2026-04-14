import { createUploadedImageResponse } from "@/lib/uploaded-image-response";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type UploadedImageRouteContext = {
  params: Promise<{
    path: string[];
  }>;
};

export async function GET(
  _request: Request,
  { params }: UploadedImageRouteContext,
) {
  const { path } = await params;

  return createUploadedImageResponse(path);
}
