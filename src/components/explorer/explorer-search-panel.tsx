"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  KnowledgeChain,
  MarginNote,
  type KnowledgeChainItem,
} from "@/components/editorial";
import type { KnowledgeSearchResult } from "@/features/search";
import type { ConceptKnowledge } from "@/types/knowledge-graph";

import {
  buildSearchNavItems,
  type SearchNavItem,
} from "./search-result-links";
import { conceptPath, lemmaPath } from "./explorer-routes";

function buildLemmaChain(results: KnowledgeSearchResult): KnowledgeChainItem[] {
  const chain: KnowledgeChainItem[] = [];

  for (const lemma of results.lemmas.slice(0, 4)) {
    chain.push({
      label: lemma.lemma,
      href: lemmaPath(lemma.lemma, lemma.partOfSpeech),
    });
  }

  for (const form of results.forms.slice(0, 3)) {
    chain.push({
      label: form.original,
      href: lemmaPath(form.lemma, "noun"),
    });
  }

  for (const concept of results.concepts.slice(0, 4)) {
    chain.push({
      label: concept.title,
      href: conceptPath(concept.conceptKey),
    });
  }

  return chain.slice(0, 10);
}

function secondaryPaths(items: SearchNavItem[], primaryHref: string): SearchNavItem[] {
  return items.filter((item) => item.href !== primaryHref).slice(0, 8);
}

function ExplorerSearchPanelInner({ autoFocus = false }: { autoFocus?: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<KnowledgeSearchResult | null>(null);
  const [conceptGraph, setConceptGraph] = useState<ConceptKnowledge | null>(null);
  const [loading, setLoading] = useState(false);

  const navItems = useMemo(
    () => (results ? buildSearchNavItems(results) : []),
    [results],
  );

  const runSearch = useCallback(async (q: string) => {
    if (q.trim().length < 1) {
      setResults(null);
      setConceptGraph(null);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&limit=12`);
      if (!res.ok) {
        return;
      }
      const data = (await res.json()) as KnowledgeSearchResult;
      setResults(data);

      const primaryConcept = data.concepts[0];
      if (primaryConcept) {
        const conceptRes = await fetch(
          `/api/knowledge/concept?key=${encodeURIComponent(primaryConcept.conceptKey)}`,
        );
        if (conceptRes.ok) {
          const payload = (await conceptRes.json()) as { concept: ConceptKnowledge };
          setConceptGraph(payload.concept);
          return;
        }
      }
      setConceptGraph(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    const timer = setTimeout(() => void runSearch(query), 200);
    return () => clearTimeout(timer);
  }, [query, runSearch]);

  useEffect(() => {
    if (autoFocus) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [autoFocus]);

  const expansionChain = useMemo((): KnowledgeChainItem[] => {
    if (!results) {
      return [];
    }

    if (conceptGraph) {
      const chain: KnowledgeChainItem[] = [
        {
          label: conceptGraph.concept.title,
          href: conceptPath(conceptGraph.concept.conceptKey),
        },
      ];

      for (const related of conceptGraph.relatedConcepts.slice(0, 6)) {
        chain.push({
          label: related.title,
          href: conceptPath(related.conceptKey),
        });
      }

      for (const lemma of conceptGraph.lemmas.slice(0, 3)) {
        chain.push({
          label: lemma.lemma,
          href: lemmaPath(lemma.lemma, lemma.partOfSpeech),
        });
      }

      return chain.slice(0, 10);
    }

    return buildLemmaChain(results);
  }, [conceptGraph, results]);

  const primaryHref = expansionChain[0]?.href ?? "";
  const alternates = secondaryPaths(navItems, primaryHref);
  const hasQuery = query.trim().length > 0;

  return (
    <div id="recherche" className="space-y-[var(--space-4)]">
      <div className="border-y border-[var(--hairline)] py-[var(--space-4)]">
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && expansionChain[0]?.href) {
              event.preventDefault();
              router.push(expansionChain[0].href);
            }
          }}
          placeholder="Chercher un mot, un concept, une expression…"
          aria-label="Recherche exploratoire"
          className="focus-kb w-full bg-transparent font-reader text-xl text-[var(--ink)] outline-none placeholder:text-[var(--ink-muted)] sm:text-2xl"
        />
      </div>

      {loading ? (
        <p className="text-metadata text-[var(--ink-muted)]">Ouverture des relations…</p>
      ) : null}

      {!loading && hasQuery && expansionChain.length > 0 ? (
        <div className="space-y-[var(--space-3)]">
          <p className="text-eyebrow">Depuis votre recherche</p>
          <KnowledgeChain items={expansionChain} />
          {conceptGraph?.concept.canonicalExplanation ? (
            <MarginNote kind="usage">
              {conceptGraph.concept.canonicalExplanation.slice(0, 220)}
            </MarginNote>
          ) : null}
          {alternates.length > 0 ? (
            <ul className="divide-y divide-[var(--hairline)] pt-[var(--space-2)]">
              {alternates.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className="focus-kb group flex items-baseline justify-between gap-4 py-2"
                  >
                    <span className="font-reader text-sm text-[var(--ink)] group-hover:text-[var(--color-link)]">
                      {item.label}
                    </span>
                    <span className="text-metadata text-[var(--ink-muted)]">{item.category} →</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      {!loading && hasQuery && expansionChain.length === 0 ? (
        <p className="text-metadata text-[var(--ink-muted)]">
          Aucune relation trouvée. Parcourez l&apos;index ci-dessous.
        </p>
      ) : null}

      {!hasQuery ? (
        <p className="text-metadata leading-relaxed text-[var(--ink-muted)]">
          La recherche ouvre des chemins — jamais une liste de résultats isolés.
        </p>
      ) : null}
    </div>
  );
}

export function ExplorerSearchPanel({ autoFocus = false }: { autoFocus?: boolean }) {
  return (
    <Suspense fallback={null}>
      <ExplorerSearchPanelInner autoFocus={autoFocus} />
    </Suspense>
  );
}
