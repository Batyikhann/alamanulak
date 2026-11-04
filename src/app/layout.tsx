import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Alaman Ulak | Улак тартыш федерациясы",
  description: "Alaman Ulak federation — the home of Kyrgyz ulak tartysh.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ky" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        {/* Light or dark follows the visitor's device (its light/dark setting), set before first paint and again
            whenever the device switches; there is no switch on the site. The light theme is <html data-theme="light">.
            A choice saved by the old switch is cleared so it no longer applies. */}
        <script dangerouslySetInnerHTML={{ __html: `try{var m=matchMedia("(prefers-color-scheme: light)"),r=document.documentElement,a=function(){if(m.matches)r.dataset.theme="light";else delete r.dataset.theme};a();m.addEventListener("change",a);localStorage.removeItem("theme")}catch(e){}` }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
