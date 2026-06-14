import type { CefrLevel, Register } from "@prisma/client";

export type ExplorerEntityKind = "lemma" | "expression" | "collocation" | "concept";

export type ExplorerEntityExample = {
  russian: string;
  translation?: string;
  explanation?: string;
  textId?: string;
  textTitle?: string;
};

export type ExplorerEntityPick = {
  label: string;
  href: string;
  meta?: string;
  translation?: string;
  typeBadge?: string;
  reason?: string;
};

export type ExplorerEntityLesson = {
  title: string;
  slug: string;
  level: string;
};

export type ExplorerEntityBadge = {
  label: string;
};

export type ExplorerEntityPageData = {
  kind: ExplorerEntityKind;
  label: string;
  translation?: string;
  typeLabel: string;
  badges: ExplorerEntityBadge[];
  heroSummary?: string;
  metadataLine: string;
  description: string;
  whyItMatters?: string;
  usageNotes?: string;
  commonMistakes?: string;
  examples: ExplorerEntityExample[];
  relatedExpressions: ExplorerEntityPick[];
  relatedGrammar: ExplorerEntityPick[];
  relatedTexts: ExplorerEntityExample[];
  relatedLessons: ExplorerEntityLesson[];
  continueExploring: ExplorerEntityPick[];
  textCount: number;
  practiceStructure: string;
  breadcrumb: Array<{ label: string; href?: string }>;
};

export type PhraseRouteHint = "collocation" | "expression";

export type ResolvedPhraseEntity = {
  canonicalLabel: string;
  canonicalPath: string;
  routeHint: PhraseRouteHint;
};

export function buildMetadataLine(typeLabel: string, cefr?: CefrLevel | string | null): string {
  return cefr ? `${typeLabel} • ${cefr}` : typeLabel;
}

export function frequencyLabelFromCount(count: number): string | undefined {
  if (count >= 100) {
    return "Very common";
  }
  if (count >= 30) {
    return "Common";
  }
  return undefined;
}

export function frequencyLabelFromScore(score: number): string | undefined {
  if (score >= 75) {
    return "Very common";
  }
  if (score >= 45) {
    return "Common";
  }
  return undefined;
}

export function registerBadge(register?: Register | string | null): string | undefined {
  switch (register) {
    case "formal":
      return "Formal";
    case "informal":
      return "Spoken";
    case "neutral":
      return "Spoken + Written";
    default:
      return undefined;
  }
}

export function firstSentence(text: string): string {
  const trimmed = text.trim();
  const match = trimmed.match(/^[^.!?]+[.!?]?/);
  return match?.[0]?.trim() ?? trimmed.slice(0, 160);
}

export function buildWhyItMatters(
  label: string,
  typeLabel: string,
  frequencyLabel?: string,
): string {
  const intro = `${label} is one of the most useful ${typeLabel.toLowerCase()}s in Russian.`;
  const middle =
    frequencyLabel === "Very common" || frequencyLabel === "Common"
      ? "It appears constantly in conversations, books and films."
      : "It appears in authentic texts and everyday speech.";
  const outro = "Mastering it unlocks more natural, fluent sentences.";
  return `${intro}\n\n${middle}\n\n${outro}`;
}

export function splitEditorialParagraphs(text: string): string[] {
  return text
    .split(/\n\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}
