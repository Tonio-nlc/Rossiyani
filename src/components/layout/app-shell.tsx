"use client";

import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { PageCanvas } from "@/components/editorial/page-canvas";
import { SyncLearningSignals } from "@/components/discovery/sync-learning-signals";
import { AppTopNav } from "@/components/layout/app-top-nav";
import { SearchProvider } from "@/components/layout/search-context";

import { OfflineBanner } from "./offline-banner";

const UniversalSearchDialog = dynamic(
  () =>
    import("@/components/search/universal-search-dialog").then((m) => ({
      default: m.UniversalSearchDialog,
    })),
  { ssr: false },
);

const NAV_SHORTCUTS = [
  { href: "/reader", shortcut: "1" },
  { href: "/explorer", shortcut: "2" },
  { href: "/practice", shortcut: "3" },
  { href: "/manual", shortcut: "4" },
  { href: "/library", shortcut: "5" },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);

  const openSearch = useCallback(() => setSearchOpen(true), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);

  const isReader = pathname.startsWith("/texts/");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === "/") {
        e.preventDefault();
        setSearchOpen(true);
        return;
      }

      if (e.altKey && !e.metaKey && !e.ctrlKey) {
        const item = NAV_SHORTCUTS.find((entry) => entry.shortcut === e.key);
        if (item) {
          e.preventDefault();
          router.push(item.href);
        }
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  return (
    <SearchProvider openSearch={openSearch}>
      <div className="min-h-screen min-w-0 overflow-x-clip bg-[var(--paper)] text-[var(--ink)]">
        <OfflineBanner />
        <AppTopNav />
        <SyncLearningSignals />
        <main className="min-w-0">
          <PageCanvas variant={isReader ? "reader" : "default"}>{children}</PageCanvas>
        </main>
        {searchOpen ? <UniversalSearchDialog open={searchOpen} onClose={closeSearch} /> : null}
      </div>
    </SearchProvider>
  );
}
