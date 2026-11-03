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
        {/* Restores the saved light/dark choice before first paint (see components/theme-toggle.tsx). */}
        <script dangerouslySetInnerHTML={{ __html: `try{if(localStorage.getItem("theme")==="light")document.documentElement.dataset.theme="light"}catch(e){}` }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
