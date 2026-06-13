"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { KnowledgeSearchResult } from "@/features/search";

import { buildSearchNavItems, groupSearchNavItems } from "@/components/explorer/search-result-links";
import { Skeleton } from "@/components/ui/skeleton";

type UniversalSearchDialogProps = {
  open: boolean;
  onClose: () => void;
};

export function UniversalSearchDialog({ open, onClose }: UniversalSearchDialogProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<KnowledgeSearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const navItems = useMemo(
    () => (results ? buildSearchNavItems(results) : []),
    [results],
  );
  const grouped = useMemo(() => groupSearchNavItems(navItems), [navItems]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setResults(null);
      setFetchError(false);
      setActiveIndex(-1);
      document.body.classList.add("modal-open");
      requestAnimationFrame(() => inputRef.current?.focus());
    } else {
      document.body.classList.remove("modal-open");
    }
    return () => document.body.classList.remove("modal-open");
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
      if (e.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, [tabindex]:not([tabindex="-1"])',
        );
        if (focusable.length === 0) {
          return;
        }
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const runSearch = useCallback(async (q: string) => {
    if (q.trim().length < 1) {
      setResults(null);
      setFetchError(false);
      setActiveIndex(-1);
      return;
    }
    setLoading(true);
    setFetchError(false);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&limit=8`);
      if (res.ok) {
        setResults((await res.json()) as KnowledgeSearchResult);
        setActiveIndex(-1);
      } else {
        setFetchError(true);
      }
    } catch {
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }
    const timer = setTimeout(() => void runSearch(query), 200);
    return () => clearTimeout(timer);
  }, [query, open, runSearch]);

  useEffect(() => {
    if (activeIndex < 0 || !listRef.current) {
      return;
    }
    const el = listRef.current.querySelector<HTMLElement>(`[data-search-index="${activeIndex}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  if (!open) {
    return null;
  }

  const onInputKeyDown = (e: React.KeyboardEvent) => {
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
      onClose();
      router.push(navItems[activeIndex].href);
    }
  };

  let flatIndex = -1;
  const hasResults = navItems.length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 px-4 pt-[8vh] backdrop-blur-sm sm:pt-[10vh]"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={dialogRef}
        className="animate-search-in w-full max-w-xl overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Recherche universelle"
      >
        <div className="flex items-start gap-2 border-b border-[var(--border)] px-4 py-3">
          <div className="min-w-0 flex-1">
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onInputKeyDown}
              placeholder="Lemme, terminaison, concept, collocation, texte…"
              aria-label="Rechercher"
              className="focus-kb w-full bg-transparent text-base text-[var(--foreground)] placeholder:text-[var(--muted)] outline-none"
            />
            <p className="mt-1 text-[10px] text-[var(--muted)]">
              ↑↓ naviguer · Entrée ouvrir · Échap fermer
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="focus-kb btn-interactive shrink-0 rounded-lg px-2 py-1 text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
          >
            ✕
          </button>
        </div>

        <div ref={listRef} className="max-h-[min(50vh,420px)] overflow-y-auto overscroll-contain p-3">
          {loading ? (
            <div className="space-y-2 px-2 py-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-3/4" />
            </div>
          ) : fetchError ? (
            <p className="px-2 py-4 text-sm text-[var(--error)]">
              Recherche indisponible. Vérifiez votre connexion.
            </p>
          ) : !hasResults && query.trim() ? (
            <p className="px-2 py-4 text-sm text-[var(--muted)]">Aucun résultat pour « {query} ».</p>
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
                        <li key={item.id} className="animate-search-in">
                          <Link
                            href={item.href}
                            data-search-index={index}
                            onClick={onClose}
                            onMouseEnter={() => setActiveIndex(index)}
                            className={[
                              "focus-kb btn-interactive block rounded-lg px-3 py-2",
                              active
                                ? "bg-[var(--accent-violet)]/15"
                                : "hover:bg-[var(--surface)]",
                            ].join(" ")}
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
            <p className="px-2 py-4 text-sm text-[var(--muted)]">
              Tapez pour explorer le graphe de connaissances.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
