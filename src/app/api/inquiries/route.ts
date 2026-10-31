import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const inquirySchema = z.object({
  name: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(5).max(40),
  email: z.union([z.string().trim().email().max(150), z.literal("")]).optional(),
  message: z.string().trim().min(4).max(2000),
  locale: z.enum(["ky", "ru"]).default("ky"),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = inquirySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Check the required fields and try again." }, { status: 400 });
  }
  await db.contactInquiry.create({ data: parsed.data });
  return NextResponse.json({ ok: true }, { status: 201 });
}