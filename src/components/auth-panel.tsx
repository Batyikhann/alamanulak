"use client";

import { ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import LocaleSync from "@/components/locale-sync";
import type { Locale } from "@/lib/i18n";

type AuthPanelProps = { locale: Locale; mode: "setup" | "login" };

const authCopy = {
  ky: {
    eyebrow: "ФЕДЕРАЦИЯНЫН БАШКАРУУСУ",
    setupTitle: "Биринчи аккаунтты түзүңүз",
    setupDescription: "Бул панель федерациянын бир өкүлүнө арналган. Аккаунт бир гана жолу түзүлөт.",
    loginTitle: "Кайра кош келиңиз",
    loginDescription: "Федерациянын башкаруу панелине кирүү.",
    username: "Колдонуучу аты",
    password: "Сырсөз",
    confirm: "Сырсөздү кайталаңыз",
    setupKey: "Бир жолку орнотуу ачкычы",
    setupButton: "Аккаунт түзүү",
    loginButton: "Кирүү",
    minPassword: "Сырсөз кеминде 12 белгиден турушу керек.",
    mismatch: "Сырсөздөр дал келген жок.",
    error: "Кирүү мүмкүн болгон жок. Маалыматты текшерип, кайра аракет кылыңыз.",
    publicSite: "Сайтка кайтуу",
    language: "RU",
  },
  ru: {
    eyebrow: "УПРАВЛЕНИЕ ФЕДЕРАЦИЕЙ",
    setupTitle: "Создайте первый аккаунт",
    setupDescription: "Панель предназначена для одного представителя федерации. Создать аккаунт можно только один раз.",
    loginTitle: "С возвращением",
    loginDescription: "Вход в панель управления федерацией.",
    username: "Имя пользователя",
    password: "Пароль",
    confirm: "Повторите пароль",
    setupKey: "Одноразовый ключ настройки",
    setupButton: "Создать аккаунт",
    loginButton: "Войти",
    minPassword: "Пароль должен содержать не менее 12 символов.",
    mismatch: "Пароли не совпадают.",
    error: "Не удалось войти. Проверьте данные и попробуйте ещё раз.",
    publicSite: "Вернуться на сайт",
    language: "КЫР",
  },
} as const;

export default function AuthPanel({ locale, mode }: AuthPanelProps) {
  const copy = authCopy[locale];
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = event.currentTarget;
    const data = new FormData(form);
    const password = String(data.get("password") ?? "");
    if (mode === "setup" && password.length < 12) {
      setError(copy.minPassword);
      return;
    }
    if (mode === "setup" && password !== data.get("confirm")) {
      setError(copy.mismatch);
      return;
    }

    setBusy(true);
    const response = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: data.get("username"),
        password,
        setupKey: data.get("setupKey"),
      }),
    }).catch(() => null);
    if (!response?.ok) {
      const payload = await response?.json().catch(() => null);
      setError(payload?.error ?? copy.error);
      setBusy(false);
      return;
    }
    router.replace(`/${locale}`);
    router.refresh();
  }

  return (
    <main className="admin-auth-shell">
      <LocaleSync locale={locale} />
      <header className="admin-auth-top">
        <a className="brand-lockup" href={`/${locale}`}><span className="brand-mark" aria-hidden="true" /><span className="brand-name">Alaman <b>Ulak</b></span></a>
        <span className="admin-auth-actions">
          <a className="language-switch" href={`/admin?lang=${locale === "ky" ? "ru" : "ky"}`}>{copy.language}</a>
        </span>
      </header>
      <section className="auth-panel">
        <div className="auth-symbol"><ShieldCheck size={22} /></div>
        <p className="eyebrow"><span className="eyebrow-dot" />{copy.eyebrow}</p>
        <h1>{mode === "setup" ? copy.setupTitle : copy.loginTitle}</h1>
        <p className="auth-description">{mode === "setup" ? copy.setupDescription : copy.loginDescription}</p>
        <form className="auth-form" onSubmit={submit}>
          <label>{copy.username}<input name="username" autoComplete="username" minLength={3} maxLength={40} required /></label>
          <label>{copy.password}<input name="password" type="password" autoComplete={mode === "setup" ? "new-password" : "current-password"} minLength={mode === "setup" ? 12 : 1} maxLength={128} required /></label>
          {mode === "setup" && <label>{copy.confirm}<input name="confirm" type="password" autoComplete="new-password" minLength={12} maxLength={128} required /></label>}
          {mode === "setup" && <label>{copy.setupKey}<input name="setupKey" type="password" autoComplete="off" maxLength={200} /></label>}
          {error && <p className="auth-error" aria-live="polite">{error}</p>}
          <button className="button button-accent" type="submit" disabled={busy}>{busy ? "..." : mode === "setup" ? copy.setupButton : copy.loginButton}<ArrowRight size={17} /></button>
        </form>
        <a className="auth-back-link" href={`/${locale}`}><ArrowLeft size={15} />{copy.publicSite}</a>
      </section>
      <footer className="auth-footer">ALAMAN ULAK <span>·</span> FEDERATION MANAGEMENT</footer>
    </main>
  );
}