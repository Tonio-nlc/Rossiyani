"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { SearchField } from "@/components/design-system";
import type { KnowledgeSearchResult } from "@/features/search";

import { buildSearchNavItems, groupSearchNavItems } from "./search-result-links";

type UniversalSearchPanelProps = {
  autoFocus?: boolean;
  placeholder?: string;
  limit?: number;
  variant?: "default" | "hero";
  initialQuery?: string;
};

export function UniversalSearchPanel({
  autoFocus = false,
  placeholder = "Chercher un mot, une terminaison, un concept, une collocation…",
  limit = 10,
  variant = "default",
  initialQuery = "",
}: UniversalSearchPanelProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<KnowledgeSearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const navItems = useMemo(
    () => (results ? buildSearchNavItems(results) : []),
    [results],
  );
  const grouped = useMemo(() => groupSearchNavItems(navItems), [navItems]);
  const isHero = variant === "hero";

  const runSearch = useCallback(
    async (q: string) => {
      if (q.trim().length < 1) {
        setResults(null);
        setActiveIndex(-1);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&limit=${limit}`);
        if (res.ok) {
          setResults((await res.json()) as KnowledgeSearchResult);
          setActiveIndex(-1);
        }
      } finally {
        setLoading(false);
      }
    },
    [limit],
  );

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

  useEffect(() => {
    if (activeIndex < 0 || !listRef.current) {
      return;
    }
    const el = listRef.current.querySelector<HTMLElement>(`[data-search-index="${activeIndex}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (navItems.length === 0) {
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % navItems.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? navItems.length - 1 : i - 1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      router.push(navItems[activeIndex].href);
    }
  };

  let flatIndex = -1;
  const hasResults = navItems.length > 0;
  const hasQuery = query.trim().length > 0;

  return (
    <section id="recherche" className="editorial-page-section space-y-4 pb-0">
      <SearchField
        inputRef={inputRef}
        value={query}
        onChange={setQuery}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        ariaLabel="Recherche universelle"
        resultCount={hasQuery && !loading && hasResults ? navItems.length : undefined}
      />
      {!isHero ? (
        <p className="text-[10px] text-[var(--ink-muted)]">
          ↑↓ pour naviguer · Entrée pour ouvrir · / depuis n&apos;importe où
        </p>
      ) : null}

      <div ref={listRef} className={isHero ? "max-h-[480px] overflow-y-auto" : "max-h-[420px] overflow-y-auto"}>
        {loading ? (
          <p className="py-2 text-sm text-[var(--ink-muted)]">Recherche…</p>
        ) : !hasResults && hasQuery ? (
          <p className="py-2 text-sm text-[var(--ink-muted)]">Aucun résultat.</p>
        ) : hasResults ? (
          <div className="space-y-4 border-t border-[var(--hairline)] pt-4">
            {[...grouped.entries()].map(([category, items]) => (
              <section key={category}>
                <h3 className="text-eyebrow">{category}</h3>
                <ul className="mt-2 divide-y divide-[var(--hairline)]">
                  {items.map((item) => {
                    flatIndex += 1;
                    const index = flatIndex;
                    const active = index === activeIndex;
                    return (
                      <li key={item.id}>
                        <Link
                          href={item.href}
                          data-search-index={index}
                          className={[
                            "focus-kb block py-2.5 transition",
                            active
                              ? "border-l-2 border-[var(--color-primary)] pl-3"
                              : "pl-3 hover:bg-[var(--surface-primary)]",
                          ].join(" ")}
                          onMouseEnter={() => setActiveIndex(index)}
                        >
                          <span className="font-reader font-medium text-[var(--ink)]">{item.label}</span>
                          {item.sublabel ? (
                            <span className="ml-2 text-xs text-[var(--ink-muted)]">{item.sublabel}</span>
                          ) : null}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        ) : (
          <p className="py-2 text-sm leading-relaxed text-[var(--ink-muted)]">
            {isHero
              ? "Tapez un mot russe, une terminaison, un concept grammatical ou le titre d'un texte."
              : "Tapez pour explorer lemmes, formes, terminaisons, concepts et collocations."}
          </p>
        )}
      </div>
    </section>
  );
}
