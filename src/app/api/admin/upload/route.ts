import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { db } from "@/lib/db";

// Admin photo upload: one image per request (the admin's browser has already shrunk it), stored in the
// database. Returns the address the forms save, /api/images/<id>?name=<file name>.
const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]);
const maxBytes = 8 * 1024 * 1024;

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File) || !allowedTypes.has(file.type) || file.size === 0 || file.size > maxBytes) {
    return NextResponse.json({ error: "Unsupported image." }, { status: 400 });
  }
  const image = await db.uploadedImage.create({
    data: { contentType: file.type, size: file.size, data: Buffer.from(await file.arrayBuffer()) },
    select: { id: true },
  });
  // The file's name rides along in the address (?name=…) so the admin forms can show it instead of a preview;
  // the image route ignores it.
  const name = file.name.replace(/[\u0000-\u001f]/g, "").trim().slice(-40);
  return NextResponse.json({ url: `/api/images/${image.id}${name ? `?name=${encodeURIComponent(name)}` : ""}` });
}
