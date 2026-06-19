import {
  casePath,
  collocationPath,
  conceptPath,
  endingPath,
  expressionPath,
  lemmaPath,
  textPath,
} from "./explorer-routes";

export type RelatedChip = {
  label: string;
  href: string;
  kind?: string;
};

export function conceptChip(conceptKey: string, title: string): RelatedChip {
  return { label: title, href: conceptPath(conceptKey) };
}

export function lemmaChip(lemma: string, pos: string): RelatedChip {
  return { label: lemma, href: lemmaPath(lemma, pos) };
}

export function endingChip(ending: string, caseKey?: string | null): RelatedChip {
  return { label: `-${ending}`, href: endingPath(ending, caseKey) };
}

export function caseChip(caseKey: string, title: string): RelatedChip {
  return { label: title, href: casePath(caseKey) };
}

export function expressionChip(label: string): RelatedChip {
  return { label, href: expressionPath(label) };
}

export function collocationChip(label: string): RelatedChip {
  return { label, href: collocationPath(label) };
}

export function textChip(textId: string, title: string): RelatedChip {
  return { label: title, href: textPath(textId) };
}

export function lessonChip(slug: string, title: string): RelatedChip {
  return { label: title, href: `/manual/lecons/${slug}` };
}
