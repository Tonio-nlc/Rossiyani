import type { Metadata } from "next";
import { EB_Garamond, Hanken_Grotesk, Inter } from "next/font/google";

import { ExplorerPathTracker } from "@/components/explorer/explorer-path-tracker";
import { AppShell } from "@/components/layout";
import { OnboardingGate } from "@/components/onboarding";
import { ToastProvider } from "@/components/design-system";

import "./globals.css";

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
          <ExplorerPathTracker />
          <OnboardingGate>
            <AppShell>{children}</AppShell>
          </OnboardingGate>
        </ToastProvider>
      </body>
    </html>
  );
}
