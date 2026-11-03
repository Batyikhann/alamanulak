import { db } from "@/lib/db";

// Serves an uploaded photo. An upload never changes (a new photo gets a new id), so browsers may cache it for good.
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const image = await db.uploadedImage.findUnique({ where: { id }, select: { contentType: true, data: true } });
  if (!image) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(image.data), {
    headers: { "Content-Type": image.contentType, "Cache-Control": "public, max-age=31536000, immutable", "X-Content-Type-Options": "nosniff" },
  });
}
