import { NextResponse } from "next/server";
import { z } from "zod";
import { createFirstAdmin, hasAdminAccount } from "@/lib/auth";

const setupSchema = z.object({
  username: z.string().trim().min(3).max(40),
  password: z.string().min(12).max(128),
  setupKey: z.string().max(200).optional(),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = setupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a username and a password of at least 12 characters." }, { status: 400 });
  }
  const expectedKey = process.env.ADMIN_SETUP_KEY;
  if (process.env.NODE_ENV === "production" && !expectedKey) {
    return NextResponse.json({ error: "Admin setup is disabled until the setup key is configured." }, { status: 503 });
  }
  if (expectedKey && parsed.data.setupKey !== expectedKey) {
    return NextResponse.json({ error: "The setup key is incorrect." }, { status: 403 });
  }
  if (await hasAdminAccount()) {
    return NextResponse.json({ error: "Admin setup is already complete." }, { status: 409 });
  }
  const created = await createFirstAdmin(parsed.data.username, parsed.data.password);
  if (!created) {
    return NextResponse.json({ error: "Setup could not be completed. Refresh and try again." }, { status: 409 });
  }
  return NextResponse.json({ ok: true });
}