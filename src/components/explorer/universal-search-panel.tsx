"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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

  const onKeyDown = (e: React.KeyboardEvent) => {
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

  return (
    <section
      id="recherche"
      className={[
        "border border-[var(--hairline)] bg-[var(--surface-primary)]",
        isHero ? "rounded-[var(--radius-md)]" : "rounded-[var(--radius-sm)]",
      ].join(" ")}
    >
      <div
        className={[
          "border-b border-[var(--hairline)]",
          isHero ? "px-5 py-6 sm:px-6 sm:py-8" : "px-4 py-3 sm:px-5",
        ].join(" ")}
      >
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          aria-label="Recherche universelle"
          className={[
            "focus-kb w-full bg-transparent text-[var(--ink)] placeholder:text-[var(--ink-muted)] outline-none",
            isHero ? "font-reader text-xl sm:text-2xl" : "text-base",
          ].join(" ")}
        />
        {!isHero ? (
          <p className="mt-1.5 text-[10px] text-[var(--ink-muted)]">
            ↑↓ pour naviguer · Entrée pour ouvrir · / depuis n&apos;importe où
          </p>
        ) : null}
      </div>

      <div
        ref={listRef}
        className={[
          "overflow-y-auto p-3 sm:p-4",
          isHero ? "max-h-[480px]" : "max-h-[420px]",
        ].join(" ")}
      >
        {loading ? (
          <p className="px-2 py-4 text-sm text-[var(--muted)]">Recherche…</p>
        ) : !hasResults && query.trim() ? (
          <p className="px-2 py-4 text-sm text-[var(--muted)]">Aucun résultat.</p>
        ) : hasResults ? (
          <div className="space-y-4">
            {[...grouped.entries()].map(([category, items]) => (
              <section key={category}>
                <h3 className="px-2 text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                  {category}
                </h3>
                <ul className="mt-1 space-y-0.5">
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
                            "focus-kb block px-3 py-2 transition",
                            active
                              ? "bg-[var(--surface-secondary)] text-[var(--ink)]"
                              : "hover:bg-[var(--surface-secondary)]/60",
                          ].join(" ")}
                          onMouseEnter={() => setActiveIndex(index)}
                        >
                          <span className="font-reader font-medium">{item.label}</span>
                          {item.sublabel ? (
                            <span className="ml-2 text-xs text-[var(--muted)]">{item.sublabel}</span>
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
          <p className="px-2 py-4 text-sm leading-relaxed text-[var(--muted)]">
            {isHero
              ? "Tapez un mot russe, une terminaison, un concept grammatical ou le titre d'un texte — le graphe entier répond en direct."
              : "Tapez pour explorer lemmes, formes, terminaisons, concepts et collocations."}
          </p>
        )}
      </div>
    </section>
  );
}
