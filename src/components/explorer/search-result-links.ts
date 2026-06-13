import type { KnowledgeSearchResult } from "@/features/search";

import {
  collocationPath,
  conceptPath,
  endingPath,
  expressionPath,
  lemmaPath,
  textPath,
} from "./explorer-routes";

export type SearchNavItem = {
  id: string;
  category: string;
  label: string;
  sublabel?: string;
  href: string;
};

export function buildSearchNavItems(results: KnowledgeSearchResult): SearchNavItem[] {
  const items: SearchNavItem[] = [];

  for (const c of results.concepts) {
    items.push({
      id: `concept-${c.id}`,
      category: "Concepts",
      label: c.title,
      sublabel: c.category,
      href: conceptPath(c.conceptKey),
    });
  }

  for (const l of results.lemmas) {
    items.push({
      id: `lemma-${l.id}`,
      category: "Lemmes",
      label: l.lemma,
      sublabel: `${l.partOfSpeech} · ${l.occurrenceCount}×`,
      href: lemmaPath(l.lemma, l.partOfSpeech),
    });
  }

  for (const f of results.forms) {
    items.push({
      id: `form-${f.id}`,
      category: "Formes",
      label: f.original,
      sublabel: `${f.lemma}${f.ending ? ` · -${f.ending}` : ""}`,
      href: lemmaPath(f.lemma, "noun"),
    });
  }

  for (const e of results.endings) {
    items.push({
      id: `ending-${e.id}`,
      category: "Terminaisons",
      label: `-${e.ending}`,
      sublabel: e.caseKey,
      href: endingPath(e.ending, e.caseKey),
    });
  }

  for (const p of results.phrases) {
    const isCollocation = p.type === "COLLOCATION";
    items.push({
      id: `phrase-${p.id}`,
      category: isCollocation ? "Collocations" : "Expressions",
      label: p.label,
      sublabel: `${p.type} · ${p.occurrenceCount}×`,
      href: isCollocation ? collocationPath(p.label) : expressionPath(p.label),
    });
  }

  for (const t of results.texts) {
    items.push({
      id: `text-${t.id}`,
      category: "Textes",
      label: t.title,
      sublabel: `${t.level} · ${t.sentenceCount} ph.`,
      href: textPath(t.id),
    });
  }

  return items;
}

export function groupSearchNavItems(items: SearchNavItem[]): Map<string, SearchNavItem[]> {
  const groups = new Map<string, SearchNavItem[]>();
  for (const item of items) {
    const list = groups.get(item.category) ?? [];
    list.push(item);
    groups.set(item.category, list);
  }
  return groups;
}
