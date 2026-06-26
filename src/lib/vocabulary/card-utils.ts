import type { VocabularyBadge, VocabularyBadgeTone } from "./types";

export function vocabularyWordPath(id: string): string {
  return `/vocabulary/words/${id}`;
}

export function vocabularyExpressionPath(id: string): string {
  return `/vocabulary/expressions/${id}`;
}

export function vocabularySentencePath(id: string): string {
  return `/vocabulary/sentences/${id}`;
}

export function badgeToneForPos(pos: string | null | undefined): VocabularyBadgeTone {
  if (!pos) {
    return "slate";
  }
  const key = pos.toLowerCase();
  if (key.includes("verbe") || key === "verb") {
    return "rose";
  }
  if (key.includes("nom") || key === "noun") {
    return "blue";
  }
  if (key.includes("adjectif") || key === "adjective") {
    return "green";
  }
  if (key.includes("adverbe") || key === "adverb") {
    return "violet";
  }
  return "slate";
}

export function createBadge(
  id: string,
  label: string,
  tone: VocabularyBadgeTone = "slate",
): VocabularyBadge {
  return { id, label, tone };
}

export function formatVocabularyDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatRelativeEncounter(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    return "Aujourd'hui";
  }
  if (diffDays === 1) {
    return "Hier";
  }
  if (diffDays < 7) {
    return `Il y a ${diffDays} jours`;
  }
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `Il y a ${weeks} semaine${weeks > 1 ? "s" : ""}`;
  }
  return formatVocabularyDate(iso);
}
