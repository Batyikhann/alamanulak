"use client";

import { useEffect } from "react";

// Bilingual admin fields show one language at a time (KY | RU). When a form is sent with a required field
// empty in the hidden language, the browser cannot point at it; this switches that field to the missing
// language and shows the browser's message there.
export default function AdminLangHelper() {
  useEffect(() => {
    let pending = false;
    const onInvalid = (event: Event) => {
      const control = event.target as HTMLInputElement | HTMLTextAreaElement;
      const field = control.closest<HTMLElement>(".admin-pair-field");
      if (!field || field.offsetParent) return;
      const radio = field.closest(".admin-pair")?.querySelector<HTMLInputElement>(`.is-${field.dataset.lang} input`);
      if (radio) radio.checked = true;
      if (pending) return;
      pending = true;
      requestAnimationFrame(() => {
        pending = false;
        control.reportValidity();
      });
    };
    document.addEventListener("invalid", onInvalid, true);
    return () => document.removeEventListener("invalid", onInvalid, true);
  }, []);
  return null;
}
