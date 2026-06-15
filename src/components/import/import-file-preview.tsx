"use client";

import { countWords, formatFileSize, isImportTitleValid } from "@/lib/import-client";
import type { PendingImportFile } from "@/lib/import-client";
import type { CefrLevel } from "@/types/domain";

import { ImportMetadataFields } from "./import-metadata-fields";

type ImportFilePreviewProps = {
  files: PendingImportFile[];
  disabled?: boolean;
  onTitleChange: (id: string, title: string) => void;
  onSourceChange: (id: string, source: string) => void;
  onLevelChange: (id: string, level: CefrLevel) => void;
  onRemove: (id: string) => void;
  onImport: () => void;
  onCancel: () => void;
};

export function ImportFilePreview({
  files,
  disabled,
  onTitleChange,
  onSourceChange,
  onLevelChange,
  onRemove,
  onImport,
  onCancel,
}: ImportFilePreviewProps) {
  if (files.length === 0) {
    return null;
  }

  const totalSentences = files.reduce((sum, f) => sum + f.estimatedSentences, 0);
  const allTitlesValid = files.every((f) => isImportTitleValid(f.title));

  return (
    <section className="space-y-4 animate-fade-up">
      <div>
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
          Créer {files.length > 1 ? "des textes" : "un texte"} dans la bibliothèque
        </h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Vérifiez le nom, la source et le niveau avant l&apos;import.
        </p>
      </div>

      <ul className="space-y-4">
        {files.map((file) => (
          <li
            key={file.id}
            className="surface-elevated rounded-2xl border border-[var(--border)] p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1 space-y-4">
                <ImportMetadataFields
                  title={file.title}
                  source={file.source}
                  level={file.level}
                  onTitleChange={(value) => onTitleChange(file.id, value)}
                  onSourceChange={(value) => onSourceChange(file.id, value)}
                  onLevelChange={(level) => onLevelChange(file.id, level)}
                  disabled={disabled}
                  fileNameHint={file.fileName}
                  titleError={
                    !isImportTitleValid(file.title) ? "Le nom du texte est obligatoire." : null
                  }
                  compact
                />

                <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-4">
                  <div>
                    <dt className="text-[10px] uppercase tracking-wider text-[var(--muted)]">Taille</dt>
                    <dd className="mt-0.5 font-medium">{formatFileSize(file.fileSizeBytes)}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] uppercase tracking-wider text-[var(--muted)]">
                      Phrases estimées
                    </dt>
                    <dd className="mt-0.5 font-medium">{file.estimatedSentences}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] uppercase tracking-wider text-[var(--muted)]">Mots</dt>
                    <dd className="mt-0.5 font-medium">{countWords(file.rawText)}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] uppercase tracking-wider text-[var(--muted)]">Niveau détecté</dt>
                    <dd className="mt-0.5 font-medium">{file.detectedLevel ?? "—"}</dd>
                  </div>
                  {file.estimatedReadingMinutes ? (
                    <div>
                      <dt className="text-[10px] uppercase tracking-wider text-[var(--muted)]">
                        Lecture estimée
                      </dt>
                      <dd className="mt-0.5 font-medium">{file.estimatedReadingMinutes} min</dd>
                    </div>
                  ) : null}
                </dl>

                {file.sourceType === "pdf" && (file.summary || file.category || file.focusPoints?.length) ? (
                  <div className="space-y-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm">
                    {file.category ? (
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--accent-violet-bright)]">
                        {file.category}
                      </p>
                    ) : null}
                    {file.summary ? (
                      <p className="leading-relaxed text-[var(--muted)]">{file.summary}</p>
                    ) : null}
                    {file.focusPoints && file.focusPoints.length > 0 ? (
                      <ul className="flex flex-wrap gap-2">
                        {file.focusPoints.map((point) => (
                          <li
                            key={point}
                            className="rounded-full border border-[var(--border)] px-2.5 py-0.5 text-[11px] text-[var(--muted)]"
                          >
                            {point}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ) : null}
              </div>
              {files.length > 1 ? (
                <button
                  type="button"
                  onClick={() => onRemove(file.id)}
                  disabled={disabled}
                  className="focus-kb shrink-0 rounded-lg px-2 py-1 text-xs text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
                  aria-label={`Retirer ${file.fileName}`}
                >
                  Retirer
                </button>
              ) : null}
            </div>
          </li>
        ))}
      </ul>

      {files.length > 1 ? (
        <p className="text-sm text-[var(--muted)]">
          {files.length} textes · {totalSentences} phrases estimées au total
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onImport}
          disabled={disabled || !allTitlesValid}
          className="btn-primary focus-kb rounded-xl px-6 py-3 text-sm font-semibold disabled:opacity-50"
        >
          Importer{files.length > 1 ? ` (${files.length})` : ""} dans la bibliothèque
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={disabled}
          className="focus-kb rounded-xl border border-[var(--border)] px-5 py-3 text-sm text-[var(--muted)] hover:border-[var(--border-strong)] hover:text-[var(--foreground)]"
        >
          Annuler
        </button>
      </div>
    </section>
  );
}
