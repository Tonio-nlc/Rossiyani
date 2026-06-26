import type { Metadata } from "next";
import { EB_Garamond, Hanken_Grotesk, Inter } from "next/font/google";

import { ToastProvider } from "@/components/design-system";
import { AppShell } from "@/components/layout";

import "./globals.css";
import "./rossiyani-v3.css";
import "./rossiyani-header.css";
import "./rossiyani-primitives.css";
import "./rossiyani-v3-canvas.css";
import "./rossiyani-v3-layouts.css";
import "./editorial-shell.css";
import "./workspace-v2-areas.css";
import "./practice-workspace.css";
import "./lessons-workspace.css";
import "./vocabulary-workspace.css";
import "./settings-workspace.css";

const fontEditorial = EB_Garamond({
  subsets: ["latin", "cyrillic"],
  variable: "--font-editorial-next",
  display: "swap",
});

const fontUi = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-ui-next",
  display: "swap",
});

const fontWorkspace = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-workspace",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Rossiyani",
  description: "Russian Deep Reading — lecture profonde du russe",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${fontEditorial.variable} ${fontUi.variable} ${fontWorkspace.variable}`}
    >
      <body>
        <ToastProvider>
          <AppShell>{children}</AppShell>
        </ToastProvider>
      </body>
    </html>
  );
}
