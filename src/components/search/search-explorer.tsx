"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import type { KnowledgeSearchResult } from "@/features/search";

export function SearchExplorer() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<KnowledgeSearchResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length < 1) {
        setResults(null);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=12`);
        if (res.ok) {
          setResults((await res.json()) as KnowledgeSearchResult);
        }
      } finally {
        setLoading(false);
      }
    }, 180);
    return () => clearTimeout(timer);
  }, [query]);

  const total =
    (results?.texts.length ?? 0) +
    (results?.lemmas.length ?? 0) +
    (results?.forms.length ?? 0) +
    (results?.concepts.length ?? 0) +
    (results?.phrases.length ?? 0) +
    (results?.endings.length ?? 0);

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-6">
      <input
        type="search"
        autoFocus
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="городок, prépositionnel, в + …"
        className="focus-kb w-full border-b border-neutral-200 bg-transparent pb-3 font-reader text-2xl text-neutral-900 placeholder:text-neutral-300 outline-none"
      />

      <p className="mt-2 text-xs text-neutral-400">
        {loading ? "Recherche…" : query.trim() ? `${total} résultat${total !== 1 ? "s" : ""}` : "Tapez pour filtrer"}
      </p>

      {results ? (
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <ResultGroup title="Textes" count={results.texts.length}>
            {results.texts.map((t) => (
              <Link
                key={t.id}
                href={`/texts/${t.id}`}
                className="animate-search-in block rounded-lg px-3 py-2 hover:bg-neutral-50"
              >
                <span className="font-medium">{t.title}</span>
                <span className="ml-2 text-xs text-neutral-500">{t.level}</span>
              </Link>
            ))}
          </ResultGroup>

          <ResultGroup title="Lemmes" count={results.lemmas.length}>
            {results.lemmas.map((l) => (
              <div key={l.id} className="animate-search-in rounded-lg px-3 py-2 hover:bg-violet-50">
                <span className="font-reader text-lg">{l.lemma}</span>
                <span className="ml-2 text-xs text-neutral-500">
                  {l.partOfSpeech} · {l.occurrenceCount}×
                </span>
              </div>
            ))}
          </ResultGroup>

          <ResultGroup title="Formes & terminaisons" count={results.forms.length + results.endings.length}>
            {results.forms.map((f) => (
              <div key={f.id} className="animate-search-in rounded-lg px-3 py-2 text-sm">
                <span className="font-reader font-medium">{f.original}</span>
                {f.ending ? (
                  <span className="ml-2 rounded bg-violet-100 px-1.5 py-0.5 text-xs font-bold text-violet-900">
                    -{f.ending}
                  </span>
                ) : null}
              </div>
            ))}
            {results.endings.map((e) => (
              <div key={e.id} className="animate-search-in rounded-lg px-3 py-2 text-sm text-neutral-600">
                Terminaison <span className="font-bold text-violet-800">{e.ending}</span> ·{" "}
                {e.caseKey}
              </div>
            ))}
          </ResultGroup>

          <ResultGroup title="Concepts & collocations" count={results.concepts.length + results.phrases.length}>
            {results.concepts.map((c) => (
              <div key={c.id} className="animate-search-in rounded-lg px-3 py-2 hover:bg-cyan-50">
                {c.title}
              </div>
            ))}
            {results.phrases.map((p) => (
              <div key={p.id} className="animate-search-in rounded-lg px-3 py-2 font-reader text-sm">
                {p.label}
              </div>
            ))}
          </ResultGroup>
        </div>
      ) : null}
    </div>
  );
}

function ResultGroup({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  if (count === 0) {
    return null;
  }
  return (
    <section>
      <h3 className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
        {title} ({count})
      </h3>
      <div className="mt-2 space-y-0.5">{children}</div>
    </section>
  );
}
