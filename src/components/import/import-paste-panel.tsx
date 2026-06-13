"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import {
  analyzePastedText,
  hasImportText,
  isImportTitleValid,
  titleFromPaste,
} from "@/lib/import-client";
import type { CefrLevel } from "@/types/domain";

import { ImportMetadataFields } from "./import-metadata-fields";

type ImportPastePanelProps = {
  text: string;
  title: string;
  source: string;
  level: CefrLevel;
  disabled?: boolean;
  onTextChange: (text: string) => void;
  onTitleChange: (title: string) => void;
  onSourceChange: (source: string) => void;
  onLevelChange: (level: CefrLevel) => void;
  onAnalyze: () => void;
};

export function ImportPastePanel({
  text,
  title,
  source,
  level,
  disabled,
  onTextChange,
  onTitleChange,
  onSourceChange,
  onLevelChange,
  onAnalyze,
}: ImportPastePanelProps) {
  const stats = useMemo(() => analyzePastedText(text), [text]);
  const canAnalyze = hasImportText(text) && isImportTitleValid(title);
  const [titleTouched, setTitleTouched] = useState(false);
  const [titleError, setTitleError] = useState<string | null>(null);
  const lastAutoTitle = useRef("");

  useEffect(() => {
    if (titleTouched || !hasImportText(text)) {
      return;
    }
    const suggested = titleFromPaste(text);
    if (suggested !== lastAutoTitle.current || !title.trim()) {
      lastAutoTitle.current = suggested;
      onTitleChange(suggested);
    }
  }, [text, title, titleTouched, onTitleChange]);

  const handleAnalyze = () => {
    if (!isImportTitleValid(title)) {
      setTitleError("Le nom du texte est obligatoire.");
      return;
    }
    setTitleError(null);
    onAnalyze();
  };

  return (
    <section className="space-y-5">
      <div className="flex items-center gap-2">
        <span className="text-xl" aria-hidden>
          📋
        </span>
        <h2 className="font-reader text-xl font-semibold text-[var(--foreground)]">
          Coller un texte
        </h2>
        <span className="rounded-full bg-[var(--accent-violet)]/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--accent-violet-bright)]">
          recommandé
        </span>
      </div>

      <ImportMetadataFields
        title={title}
        source={source}
        level={level}
        onTitleChange={(value) => {
          setTitleTouched(true);
          setTitleError(null);
          onTitleChange(value);
        }}
        onSourceChange={onSourceChange}
        onLevelChange={onLevelChange}
        disabled={disabled}
        titleError={titleError}
      />

      <textarea
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
        disabled={disabled}
        placeholder="Collez ici votre texte russe…"
        rows={10}
        className="focus-kb w-full resize-y rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-4 font-reader text-lg leading-relaxed text-[var(--foreground)] placeholder:text-[var(--muted)]/60 focus:border-[var(--accent-violet)]/40 focus:shadow-[var(--shadow-glow)] disabled:opacity-50"
      />

      <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <div>
          <dt className="text-[10px] uppercase tracking-wider text-[var(--muted)]">Caractères</dt>
          <dd className="mt-0.5 font-semibold tabular-nums">{stats.characters.toLocaleString("fr-FR")}</dd>
        </div>
        <div>
          <dt className="text-[10px] uppercase tracking-wider text-[var(--muted)]">Mots</dt>
          <dd className="mt-0.5 font-semibold tabular-nums">{stats.words.toLocaleString("fr-FR")}</dd>
        </div>
        <div>
          <dt className="text-[10px] uppercase tracking-wider text-[var(--muted)]">Phrases estimées</dt>
          <dd className="mt-0.5 font-semibold tabular-nums">{stats.estimatedSentences}</dd>
        </div>
        <div>
          <dt className="text-[10px] uppercase tracking-wider text-[var(--muted)]">Lecture estimée</dt>
          <dd className="mt-0.5 font-semibold tabular-nums">~{stats.estimatedReadingMinutes} min</dd>
        </div>
      </dl>

      <button
        type="button"
        onClick={handleAnalyze}
        disabled={disabled || !canAnalyze}
        className="btn-primary focus-kb rounded-xl px-6 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
      >
        Créer le texte dans la bibliothèque
      </button>
    </section>
  );
}
