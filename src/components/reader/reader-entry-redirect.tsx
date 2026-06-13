"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { getMostRecentReadingTextId } from "@/lib/reader/reading-progress";

export function ReaderEntryRedirect() {
  const router = useRouter();

  useEffect(() => {
    const textId = getMostRecentReadingTextId();
    router.replace(textId ? `/texts/${textId}` : "/library");
  }, [router]);

  return (
    <p className="text-metadata text-[var(--ink-muted)]">Ouverture de la lecture…</p>
  );
}
