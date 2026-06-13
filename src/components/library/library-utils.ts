import type { CefrLevel } from "@/types";
import type { TextListItem } from "@/features/texts";

export type LibraryTag =
  | "articles"
  | "dialogues"
  | "contes"
  | "telegram"
  | "actualites";

export type LibraryTagFilter = LibraryTag | "all";

export const LIBRARY_LEVELS: CefrLevel[] = ["A1", "A2", "B1", "B2", "C1", "Native"];

export const LIBRARY_TAGS: Array<{ id: LibraryTag; label: string }> = [
  { id: "articles", label: "Articles" },
  { id: "dialogues", label: "Dialogues" },
  { id: "contes", label: "Contes" },
  { id: "telegram", label: "Telegram" },
  { id: "actualites", label: "Actualités" },
];

const TAG_MATCHERS: Record<LibraryTag, RegExp> = {
  articles: /article|journal|presse|blog|medium/i,
  dialogues: /dialogue|conversation|chat|échange/i,
  contes: /conte|fable|nouvelle|story|рассказ/i,
  telegram: /telegram|tg|канал/i,
  actualites: /actualit|news|новост|presse/i,
};

export function detectTextTags(text: TextListItem): LibraryTag[] {
  const haystack = `${text.title} ${text.source ?? ""}`;
  return LIBRARY_TAGS.filter(({ id }) => TAG_MATCHERS[id].test(haystack)).map(({ id }) => id);
}

export function textMatchesTag(text: TextListItem, tag: LibraryTag): boolean {
  return detectTextTags(text).includes(tag);
}

export function estimateReadingMinutes(sentenceCount: number): number {
  return Math.max(1, Math.ceil(sentenceCount * 0.45));
}

export function estimateWordCount(sentenceCount: number): number {
  return sentenceCount * 12;
}

export function formatStat(value: number): string {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}k`;
  }
  return value.toLocaleString("fr-FR");
}

export function filterLibraryTexts(
  texts: TextListItem[],
  query: string,
  level: CefrLevel | "all",
  tag: LibraryTagFilter,
): TextListItem[] {
  const q = query.trim().toLowerCase();
  return texts.filter((text) => {
    if (level !== "all" && text.level !== level) {
      return false;
    }
    if (tag !== "all" && !textMatchesTag(text, tag)) {
      return false;
    }
    if (!q) {
      return true;
    }
    const inTitle = text.title.toLowerCase().includes(q);
    const inSource = (text.source ?? "").toLowerCase().includes(q);
    const inLevel = text.level.toLowerCase().includes(q);
    return inTitle || inSource || inLevel;
  });
}
