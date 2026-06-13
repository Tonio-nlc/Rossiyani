"use client";

import Link from "next/link";
import { memo } from "react";

import type { TextListItem } from "@/features/texts";

import { LibraryCardActions } from "./library-card-actions";
import { LibraryCardProgress } from "./library-card-progress";
import {
  detectTextTags,
  estimateReadingMinutes,
  estimateWordCount,
  LIBRARY_TAGS,
} from "./library-utils";

type LibraryCardProps = {
  text: TextListItem;
  disabled?: boolean;
  onRename: (text: TextListItem) => void;
  onDelete: (text: TextListItem) => void;
};

const LEVEL_COLORS: Record<string, string> = {
  A1: "from-emerald-500/20 to-emerald-500/5 text-emerald-300",
  A2: "from-teal-500/20 to-teal-500/5 text-teal-300",
  B1: "from-cyan-500/20 to-cyan-500/5 text-cyan-300",
  B2: "from-violet-500/20 to-violet-500/5 text-violet-300",
  C1: "from-fuchsia-500/20 to-fuchsia-500/5 text-fuchsia-300",
  Native: "from-amber-500/20 to-amber-500/5 text-amber-300",
};

export const LibraryCard = memo(function LibraryCard({
  text,
  disabled = false,
  onRename,
  onDelete,
}: LibraryCardProps) {
  const tags = detectTextTags(text);
  const minutes = estimateReadingMinutes(text.sentenceCount);
  const wordEstimate = estimateWordCount(text.sentenceCount);
  const levelStyle = LEVEL_COLORS[text.level] ?? LEVEL_COLORS.B1;

  return (
    <article className="group relative h-full">
      <div className="absolute right-3 top-3 z-30">
        <LibraryCardActions
          disabled={disabled}
          onRename={() => onRename(text)}
          onDelete={() => onDelete(text)}
        />
      </div>

      <Link
        href={`/texts/${text.id}`}
        prefetch
        className="focus-kb card-hover surface-elevated flex h-full flex-col rounded-2xl border border-[var(--border)] p-5 shadow-[var(--shadow-soft)] outline-none"
      >
        <div className="flex items-start justify-between gap-3 pr-8">
          <span
            className={`inline-flex rounded-full bg-gradient-to-br px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${levelStyle}`}
          >
            {text.level}
          </span>
          <span className="text-xs text-[var(--muted)]">{minutes} min</span>
        </div>

        <h2 className="mt-4 font-reader text-xl font-semibold leading-snug text-[var(--foreground)] transition group-hover:text-[var(--accent-violet-bright)]">
          {text.title}
        </h2>

        {text.source ? (
          <p className="mt-1.5 text-sm text-[var(--muted)]">{text.source}</p>
        ) : (
          <p className="mt-1.5 text-sm italic text-[var(--muted)]/60">Source non renseignée</p>
        )}

        {tags.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {tags.map((tagId) => {
              const label = LIBRARY_TAGS.find((t) => t.id === tagId)?.label ?? tagId;
              return (
                <span
                  key={tagId}
                  className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[var(--muted)]"
                >
                  {label}
                </span>
              );
            })}
          </div>
        ) : null}

        <LibraryCardProgress textId={text.id} />

        <div className="mt-auto grid grid-cols-2 gap-2 border-t border-[var(--border)] pt-4">
          <Metric label="Phrases" value={String(text.sentenceCount)} />
          <Metric label="Mots" value={`≈${wordEstimate}`} muted />
        </div>

        <span className="btn-primary btn-interactive mt-4 inline-flex w-full items-center justify-center rounded-xl py-2.5 text-sm font-semibold group-hover:shadow-[var(--shadow-glow)]">
          Lire
        </span>
      </Link>
    </article>
  );
});

function Metric({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="text-center">
      <p
        className={[
          "text-base font-semibold",
          muted ? "text-[var(--muted)]" : "text-[var(--foreground)]",
        ].join(" ")}
      >
        {value}
      </p>
      <p className="text-[10px] uppercase tracking-wide text-[var(--muted)]">{label}</p>
    </div>
  );
}
