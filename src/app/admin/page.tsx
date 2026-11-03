import { redirect } from "next/navigation";
import "./admin.css";
import { connection } from "next/server";
import AuthPanel from "@/components/auth-panel";
import { hasAdminAccount, isAdminAuthenticated } from "@/lib/auth";
import type { Locale } from "@/lib/i18n";

export const instant = false;

// The way in: /admin shows the sign-in (or first-account setup). A signed-in admin is sent to the normal
// site, which then shows their avatar in the header; the avatar opens the settings at /admin/settings.
type AdminPageProps = {
  searchParams: Promise<{ lang?: string }>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  await connection();
  const query = await searchParams;
  const locale: Locale = query.lang === "ru" ? "ru" : "ky";
  if (!(await hasAdminAccount())) return <AuthPanel locale={locale} mode="setup" />;
  if (!(await isAdminAuthenticated())) return <AuthPanel locale={locale} mode="login" />;
  redirect(`/${locale}`);
}
