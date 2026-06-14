import type { CefrLevel } from "@prisma/client";

export type ExplorerEntityKind = "lemma" | "expression" | "collocation" | "concept";

export type ExplorerEntityExample = {
  russian: string;
  translation?: string;
  textId?: string;
  textTitle?: string;
};

export type ExplorerEntityPick = {
  label: string;
  href: string;
  meta?: string;
};

export type ExplorerEntityLesson = {
  title: string;
  slug: string;
  level: string;
};

export type ExplorerEntityPageData = {
  kind: ExplorerEntityKind;
  label: string;
  translation?: string;
  metadataLine: string;
  description: string;
  examples: ExplorerEntityExample[];
  relatedExpressions: ExplorerEntityPick[];
  relatedGrammar: ExplorerEntityPick[];
  relatedTexts: ExplorerEntityExample[];
  relatedLessons: ExplorerEntityLesson[];
  continueExploring: ExplorerEntityPick[];
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
