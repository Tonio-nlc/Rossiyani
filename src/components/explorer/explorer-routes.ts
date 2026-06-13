import type { PartOfSpeech } from "@/types";

export const EXPLORER_CATEGORIES = [
  {
    id: "concepts",
    href: "/explorer/concepts",
    label: "Concepts",
    icon: "🧠",
    description: "Patterns grammaticaux, cas, constructions",
  },
  {
    id: "cases",
    href: "/explorer/cases",
    label: "Cas",
    icon: "📐",
    description: "Les six cas + locatif",
  },
  {
    id: "endings",
    href: "/explorer/endings",
    label: "Terminaisons",
    icon: "✦",
    description: "Terminaisons réutilisables et leur fonction",
  },
  {
    id: "lemmas",
    href: "/explorer/lemmas",
    label: "Lemmes",
    icon: "📖",
    description: "Dictionnaire cumulatif du graphe",
  },
  {
    id: "expressions",
    href: "/explorer/expressions",
    label: "Expressions",
    icon: "💬",
    description: "Expressions figées et constructions natives",
  },
  {
    id: "collocations",
    href: "/explorer/collocations",
    label: "Collocations",
    icon: "🔗",
    description: "Cooccurrences fréquentes entre mots",
  },
] as const;

export function conceptPath(conceptKey: string): string {
  return `/explorer/concepts/${encodeURIComponent(conceptKey)}`;
}

export function lemmaPath(lemma: string, partOfSpeech: PartOfSpeech | string): string {
  return `/explorer/lemmas/${encodeURIComponent(lemma)}?pos=${encodeURIComponent(partOfSpeech)}`;
}

export function endingPath(ending: string, caseKey?: string | null): string {
  const base = `/explorer/endings/${encodeURIComponent(ending)}`;
  return caseKey ? `${base}?case=${encodeURIComponent(caseKey)}` : base;
}

export function casePath(caseKey: string): string {
  return `/explorer/cases/${encodeURIComponent(caseKey)}`;
}

export function expressionPath(label: string): string {
  return `/explorer/expressions/${encodeURIComponent(label)}`;
}

export function collocationPath(label: string): string {
  return `/explorer/collocations/${encodeURIComponent(label)}`;
}

export function textPath(textId: string): string {
  return `/texts/${textId}`;
}
