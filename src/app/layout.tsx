import type { Metadata } from "next";

import { ExplorerPathTracker } from "@/components/explorer/explorer-path-tracker";
import { AppShell } from "@/components/layout";
import { OnboardingGate } from "@/components/onboarding";
import { ToastProvider } from "@/components/ui";

import "./globals.css";

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
    <html lang="fr">
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
