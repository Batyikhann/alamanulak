"use client";

import { useEffect } from "react";

// On screens too narrow for every section, the admin navbar slides sideways: this keeps the open section in view.
export default function AdminNavScroll({ tab }: { tab: string }) {
  useEffect(() => {
    const nav = document.querySelector<HTMLElement>(".admin-nav");
    const active = nav?.querySelector<HTMLElement>(".is-active");
    if (nav && active) nav.scrollLeft = active.offsetLeft - nav.offsetLeft - (nav.clientWidth - active.offsetWidth) / 2;
  }, [tab]);
  return null;
}
