"use client";

import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { EditorialContainer, TopNavigation } from "@/components/design-system";
import { SyncLearningSignals } from "@/components/discovery/sync-learning-signals";
import { SearchProvider } from "@/components/layout/search-context";

import { OfflineBanner } from "./offline-banner";

const UniversalSearchDialog = dynamic(
  () =>
    import("@/components/search/universal-search-dialog").then((m) => ({
      default: m.UniversalSearchDialog,
    })),
  { ssr: false },
);

import { NAV_KEYBOARD_SHORTCUTS } from "@/lib/navigation/main-nav";

function resolvePageRootClass(pathname: string | null): string {
  const r3 = "r3-page-root";

  if (pathname?.startsWith("/settings")) {
    return `settings-page-root v2-page-root ${r3}`;
  }
  if (pathname?.startsWith("/import")) {
    return `import-page-root v2-page-root ${r3}`;
  }
  if (pathname?.startsWith("/practice")) {
    return `practice-page-root ${r3}`;
  }
  if (pathname?.startsWith("/lessons")) {
    return `lessons-page-root ${r3}`;
  }
  if (pathname?.startsWith("/vocabulary")) {
    return `vocabulary-page-root ${r3}`;
  }
  if (pathname?.startsWith("/texts/") || pathname === "/reader") {
    return `reader-page-root v2-page-root ${r3}`;
  }
  return `v2-page-root ${r3}`;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const pageRootClass = resolvePageRootClass(pathname);
  const [searchOpen, setSearchOpen] = useState(false);
  const openSearch = useCallback(() => setSearchOpen(true), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);

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
        const item = NAV_KEYBOARD_SHORTCUTS.find((entry) => entry.shortcut === e.key);
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
      <div className={["min-h-screen min-w-0 overflow-x-clip", pageRootClass].join(" ")}>
        <OfflineBanner />
        <TopNavigation onOpenSearch={openSearch} />
        <SyncLearningSignals />
        <EditorialContainer as="main" className="ds-app-main min-w-0">
          {children}
        </EditorialContainer>
        {searchOpen ? <UniversalSearchDialog open={searchOpen} onClose={closeSearch} /> : null}
      </div>
    </SearchProvider>
  );
}
