import { getCollectionName } from "@/content/collections";
import type { TextListItem } from "@/features/texts";
import { estimateReadingMinutes } from "@/components/library/library-utils";
import type { SessionJournal } from "@/lib/home/build-session-journal";

export type ContinueReadingMeta = {
  title: string;
  collection: string;
  collectionId: TextListItem["collectionId"] | null;
  level: string;
  href: string;
  textId: string | null;
  detail: string;
  sentenceCount: number;
  estimatedMinutes: number;
};

function textIdFromHref(href?: string): string | null {
  if (!href?.startsWith("/texts/")) {
    return null;
  }
  return href.slice("/texts/".length).split("/")[0] ?? null;
}

export function resolveContinueReading(
  narrative: SessionJournal,
  texts: TextListItem[],
): ContinueReadingMeta | null {
  const entry = narrative.continueReading;
  if (!entry?.href) {
    const fallback = texts[0];
    if (!fallback) {
      return null;
    }
    return {
      title: fallback.title,
      collection: getCollectionName(fallback.collectionId),
      collectionId: fallback.collectionId,
      level: fallback.level,
      href: `/texts/${fallback.id}`,
      textId: fallback.id,
      detail: "Start your first reading session.",
      sentenceCount: fallback.sentenceCount,
      estimatedMinutes: estimateReadingMinutes(fallback.sentenceCount),
    };
  }

  const textId = textIdFromHref(entry.href);
  const text = textId ? texts.find((item) => item.id === textId) : null;

  return {
    title: entry.label,
    collection: entry.collectionName ?? (text ? getCollectionName(text.collectionId) : "Library"),
    collectionId: text?.collectionId ?? null,
    level: text?.level ?? "—",
    href: entry.href,
    textId,
    detail: entry.detail ?? "Pick up where you left off.",
    sentenceCount: text?.sentenceCount ?? 0,
    estimatedMinutes: estimateReadingMinutes(text?.sentenceCount ?? 12),
  };
}
