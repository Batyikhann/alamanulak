"use client";

import { Moon, Sun } from "lucide-react";

// The theme lives on <html data-theme>; the inline script in app/layout.tsx restores it before paint.
// The public site and the admin share it, so a choice made on one carries over to the other.
export function toggleTheme() {
  const root = document.documentElement;
  const next = root.dataset.theme === "light" ? "dark" : "light";
  if (next === "light") root.dataset.theme = "light";
  else delete root.dataset.theme;
  try { localStorage.setItem("theme", next); } catch {}
}

// Sun in the dark theme, moon in the light one (globals.css shows the right icon).
export function ThemeToggle({ label, className = "icon-button theme-toggle" }: { label: string; className?: string }) {
  return (
    <button className={className} type="button" onClick={toggleTheme} aria-label={label} title={label}>
      <Sun className="theme-icon-sun" size={18} aria-hidden="true" />
      <Moon className="theme-icon-moon" size={18} aria-hidden="true" />
    </button>
  );
}
