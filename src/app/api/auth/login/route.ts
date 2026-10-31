import { NextResponse } from "next/server";
import { z } from "zod";
import { loginAdmin } from "@/lib/auth";

const loginSchema = z.object({
  username: z.string().trim().min(1).max(40),
  password: z.string().min(1).max(128),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success || !(await loginAdmin(parsed.data.username, parsed.data.password))) {
    return NextResponse.json({ error: "The username or password is incorrect." }, { status: 401 });
  }
  return NextResponse.json({ ok: true });
}