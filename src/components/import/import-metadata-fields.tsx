"use client";

import type { CefrLevel } from "@/types/domain";

const LEVELS: CefrLevel[] = ["A1", "A2", "B1", "B2", "C1", "Native"];

type ImportMetadataFieldsProps = {
  title: string;
  source: string;
  level: CefrLevel;
  onTitleChange: (value: string) => void;
  onSourceChange: (value: string) => void;
  onLevelChange: (level: CefrLevel) => void;
  disabled?: boolean;
  titleError?: string | null;
  fileNameHint?: string;
  compact?: boolean;
};

export function ImportMetadataFields({
  title,
  source,
  level,
  onTitleChange,
  onSourceChange,
  onLevelChange,
  disabled,
  titleError,
  fileNameHint,
  compact = false,
}: ImportMetadataFieldsProps) {
  return (
    <div
      className={[
        "grid gap-4",
        compact ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 lg:grid-cols-3",
      ].join(" ")}
    >
      <div className={compact ? "sm:col-span-2" : "lg:col-span-1"}>
        <label className="block text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
          Nom du texte <span className="text-red-300">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          disabled={disabled}
          placeholder="Ex. : L'hiver en Russie"
          className={[
            "focus-kb mt-1.5 w-full rounded-xl border bg-[var(--surface)] px-3 py-2.5 font-reader text-base text-[var(--foreground)] placeholder:text-[var(--muted)]/60",
            titleError
              ? "border-red-500/40 focus:border-red-500/50"
              : "border-[var(--border)] focus:border-[var(--accent-violet)]/40",
          ].join(" ")}
        />
        {titleError ? (
          <p className="mt-1 text-xs text-red-300">{titleError}</p>
        ) : fileNameHint ? (
          <p className="mt-1 text-xs text-[var(--muted)]">Fichier : {fileNameHint}</p>
        ) : null}
      </div>

      <div>
        <label className="block text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
          Source
        </label>
        <input
          type="text"
          value={source}
          onChange={(e) => onSourceChange(e.target.value)}
          disabled={disabled}
          placeholder="Ex. : Wikipedia, Livre, Article…"
          className="focus-kb mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]/60 focus:border-[var(--accent-violet)]/40"
        />
      </div>

      <div>
        <label className="block text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
          Niveau CEFR
        </label>
        <select
          value={level}
          onChange={(e) => onLevelChange(e.target.value as CefrLevel)}
          disabled={disabled}
          className="focus-kb mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--foreground)]"
        >
          {LEVELS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
