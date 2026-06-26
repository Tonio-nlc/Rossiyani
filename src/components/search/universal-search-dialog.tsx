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

function SpotlightIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className="v2-spotlight__icon">
      <circle cx="7" cy="7" r="4.25" stroke="currentColor" strokeWidth="1.2" />
      <path d="M10.25 10.25 13 13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

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
  const trimmed = query.trim();

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[10vh] sm:pt-[12vh]"
      onClick={onClose}
      role="presentation"
    >
      <button type="button" aria-label="Fermer" className="v2-overlay-backdrop absolute inset-0" onClick={onClose} />
      <div
        ref={dialogRef}
        className="v2-spotlight animate-v2-in relative w-full"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Recherche"
      >
        <div className="v2-spotlight__input-row">
          <SpotlightIcon />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onInputKeyDown}
            placeholder="Mots, textes, leçons…"
            aria-label="Rechercher dans Rossiyani"
            className="v2-spotlight__input focus-kb"
            autoComplete="off"
            spellCheck={false}
          />
          <kbd className="v2-spotlight__kbd" aria-hidden>
            esc
          </kbd>
        </div>

        <div ref={listRef} className="v2-spotlight__body">
          {loading ? (
            <div aria-hidden>
              <Skeleton className="v2-spotlight__skeleton-row w-full" />
              <Skeleton className="v2-spotlight__skeleton-row w-full" />
              <Skeleton className="v2-spotlight__skeleton-row w-4/5" />
            </div>
          ) : fetchError ? (
            <p className="v2-spotlight__error">
              Connexion indisponible. Vérifiez votre réseau et réessayez.
            </p>
          ) : hasResults ? (
            <div>
              {[...grouped.entries()].map(([category, items]) => (
                <section key={category}>
                  <h3 className="v2-spotlight__group-label">{category}</h3>
                  <ul>
                    {items.map((item) => {
                      flatIndex += 1;
                      const index = flatIndex;
                      const active = index === activeIndex;
                      return (
                        <li key={item.id}>
                          <Link
                            href={item.href}
                            data-search-index={index}
                            onClick={onClose}
                            onMouseEnter={() => setActiveIndex(index)}
                            className={[
                              "v2-spotlight__result focus-kb",
                              active ? "v2-spotlight__result--active" : "",
                            ].join(" ")}
                          >
                            <span>{item.label}</span>
                            {item.sublabel ? (
                              <span className="v2-spotlight__result-sublabel">{item.sublabel}</span>
                            ) : null}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))}
            </div>
          ) : trimmed ? (
            <p className="v2-spotlight__hint">
              Aucun résultat pour <strong>« {trimmed} »</strong>. Essayez un mot russe ou un titre de texte.
            </p>
          ) : (
            <p className="v2-spotlight__hint">
              Recherchez un mot, une expression, un texte ou une leçon — partout dans Rossiyani.
            </p>
          )}
        </div>

        <footer className="v2-spotlight__footer" aria-hidden={!hasResults && !trimmed}>
          <span>
            <kbd>↑</kbd>
            <kbd>↓</kbd> naviguer
          </span>
          <span>
            <kbd>↵</kbd> ouvrir
          </span>
          <span>
            <kbd>esc</kbd> fermer
          </span>
        </footer>
      </div>
    </div>
  );
}
