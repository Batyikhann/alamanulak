import "server-only";
import { createHash, pbkdf2 as deriveKey, randomBytes, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

const pbkdf2 = promisify(deriveKey);
const SESSION_COOKIE = "alaman_admin_session";
const SESSION_SECONDS = 60 * 60 * 12;
const ADMIN_ID = "federation-admin";

async function passwordHash(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = await pbkdf2(password, salt, 310_000, 32, "sha256");
  return `${salt}:${derived.toString("hex")}`;
}

async function passwordMatches(password: string, stored: string) {
  const [salt, expectedHex] = stored.split(":");
  if (!salt || !expectedHex) return false;
  const actual = await pbkdf2(password, salt, 310_000, 32, "sha256");
  const expected = Buffer.from(expectedHex, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

function tokenHash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

async function beginSession() {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_SECONDS * 1000);
  await db.adminAccount.update({
    where: { id: ADMIN_ID },
    data: { sessionTokenHash: tokenHash(token), sessionExpiresAt: expiresAt },
  });
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function hasAdminAccount() {
  return Boolean(await db.adminAccount.findUnique({ where: { id: ADMIN_ID }, select: { id: true } }));
}

export async function createFirstAdmin(username: string, password: string) {
  if (await hasAdminAccount()) return false;
  try {
    await db.adminAccount.create({
      data: { id: ADMIN_ID, username, passwordHash: await passwordHash(password) },
    });
  } catch {
    return false;
  }
  await beginSession();
  return true;
}

export async function loginAdmin(username: string, password: string) {
  const admin = await db.adminAccount.findUnique({ where: { username } });
  if (!admin || !(await passwordMatches(password, admin.passwordHash))) return false;
  await beginSession();
  return true;
}

// The admin changes their own sign-in username and/or password, confirming with the current password.
// A new session starts (the old token stops working), so the admin stays signed in on this device only.
export async function changeAdminCredentials(currentPassword: string, username: string, newPassword: string) {
  const admin = await db.adminAccount.findUnique({ where: { id: ADMIN_ID } });
  if (!admin || !(await passwordMatches(currentPassword, admin.passwordHash))) return false;
  await db.adminAccount.update({
    where: { id: ADMIN_ID },
    data: { username, ...(newPassword ? { passwordHash: await passwordHash(newPassword) } : {}) },
  });
  await beginSession();
  return true;
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return false;
  const admin = await db.adminAccount.findUnique({ where: { id: ADMIN_ID } });
  if (!admin?.sessionTokenHash || !admin.sessionExpiresAt) return false;
  if (admin.sessionExpiresAt.getTime() <= Date.now()) return false;
  const actual = Buffer.from(tokenHash(token), "hex");
  const expected = Buffer.from(admin.sessionTokenHash, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export async function endAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    const admin = await db.adminAccount.findUnique({ where: { id: ADMIN_ID } });
    if (admin?.sessionTokenHash === tokenHash(token)) {
      await db.adminAccount.update({
        where: { id: ADMIN_ID },
        data: { sessionTokenHash: null, sessionExpiresAt: null },
      });
    }
  }
  cookieStore.set(SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
}

export async function currentAdminUsername() {
  if (!(await isAdminAuthenticated())) return null;
  const admin = await db.adminAccount.findUnique({
    where: { id: ADMIN_ID },
    select: { username: true },
  });
  return admin?.username ?? null;
}

// The signed-in admin's name and photo for the site header, or null for everyone else.
export async function getAdminProfile() {
  if (!(await isAdminAuthenticated())) return null;
  const admin = await db.adminAccount.findUnique({ where: { id: ADMIN_ID }, select: { username: true, displayName: true, photoUrl: true } });
  return admin ? { name: admin.displayName || admin.username, photoUrl: admin.photoUrl } : null;
}
