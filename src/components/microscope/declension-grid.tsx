"use client";

import { useState } from "react";

import { EndingBadge } from "@/components/analysis/ending-badge";
import { formatCaseLabelFr } from "@/features/grammar";
import type { WordDetailGraph } from "@/types/word-detail-graph";

type DeclensionGridProps = {
  detail: WordDetailGraph;
  onSelectForm?: (original: string) => void;
  loading?: boolean;
};

export function DeclensionGrid({ detail, onSelectForm, loading }: DeclensionGridProps) {
  const [hoveredFormId, setHoveredFormId] = useState<string | null>(null);
  const forms = detail.lemmaKnowledge?.forms ?? [];
  const currentOriginal = detail.occurrence.original;

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-12 animate-pulse rounded-lg bg-[var(--surface)]" />
        ))}
      </div>
    );
  }

  if (forms.length === 0) {
    return (
      <p className="text-center text-sm text-[var(--muted)]">
        Les formes connues apparaîtront au fil des imports.
      </p>
    );
  }

  const hoveredForm = forms.find((f) => f.id === hoveredFormId);

  return (
    <div className="space-y-2">
      {hoveredForm ? (
        <div className="microscope-highlight animate-microscope-slide rounded-lg border border-[var(--accent-violet)]/30 bg-[var(--accent-violet)]/5 px-3 py-1.5 text-xs text-[var(--muted)]">
          <span className="font-reader font-semibold text-[var(--foreground)]">
            {hoveredForm.original}
          </span>
          <span className="mx-2 text-[var(--border-strong)]">—</span>
          {hoveredForm.explanation}
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {forms.map((form, index) => {
          const isActive = form.original === currentOriginal;
          return (
            <button
              key={form.id}
              type="button"
              onClick={() => onSelectForm?.(form.original)}
              onMouseEnter={() => setHoveredFormId(form.id)}
              onMouseLeave={() => setHoveredFormId(null)}
              className={[
                "focus-kb declension-cell animate-microscope-slide rounded-lg border p-2 text-left transition",
                isActive
                  ? "border-[var(--accent-violet)] bg-[var(--accent-violet)]/15 shadow-[var(--shadow-glow)] ring-1 ring-[var(--accent-violet)]/40"
                  : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent-violet)]/30 hover:bg-[var(--surface-elevated)]",
              ].join(" ")}
              style={{ animationDelay: `${index * 40}ms` }}
            >
              <p
                className={[
                  "font-reader truncate text-base font-semibold",
                  isActive ? "text-[var(--accent-violet-bright)]" : "text-[var(--foreground)]",
                ].join(" ")}
              >
                {form.original}
              </p>
              <p className="mt-1 truncate text-[10px] uppercase tracking-wide text-[var(--muted)]">
                {formatCaseLabelFr(form.case) ?? "—"}
              </p>
              {form.ending ? (
                <div className="mt-1">
                  <EndingBadge endingText={form.ending} grammaticalCase={form.case} size="reader" />
                </div>
              ) : null}
              {isActive ? (
                <span className="mt-1 inline-block rounded bg-[var(--accent-violet)]/20 px-1 py-px text-[8px] font-bold uppercase text-[var(--accent-violet-bright)]">
                  ici
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
