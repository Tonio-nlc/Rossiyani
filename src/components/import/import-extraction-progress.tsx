"use client";

import type { ImportParsePhase } from "@/services/import/parsers";

const PHASE_LABELS: Record<ImportParsePhase, string> = {
  uploading: "Téléversement…",
  extracting: "Extraction du texte…",
  generating: "Génération du lecteur…",
  done: "Terminé",
};

type ImportExtractionProgressProps = {
  fileName: string;
  phase: ImportParsePhase;
  fileIndex?: number;
  totalFiles?: number;
};

export function ImportExtractionProgress({
  fileName,
  phase,
  fileIndex = 1,
  totalFiles = 1,
}: ImportExtractionProgressProps) {
  const steps: ImportParsePhase[] = ["uploading", "extracting", "generating", "done"];
  const currentIndex = steps.indexOf(phase);

  return (
    <section
      className="surface-elevated animate-fade-up space-y-4 rounded-2xl border border-[var(--border)] p-6"
      aria-live="polite"
      aria-busy={phase !== "done"}
    >
      <div>
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
          Préparation du fichier
        </h2>
        <p className="mt-1 font-medium text-[var(--foreground)]">{fileName}</p>
        {totalFiles > 1 ? (
          <p className="mt-0.5 text-xs text-[var(--muted)]">
            Fichier {fileIndex} sur {totalFiles}
          </p>
        ) : null}
      </div>

      <ol className="space-y-2">
        {steps.slice(0, -1).map((step, index) => {
          const isComplete = index < currentIndex;
          const isCurrent = step === phase;
          return (
            <li
              key={step}
              className={[
                "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors",
                isCurrent
                  ? "bg-[var(--accent-violet)]/10 text-[var(--foreground)]"
                  : isComplete
                    ? "text-[var(--muted)]"
                    : "text-[var(--muted)]/60",
              ].join(" ")}
            >
              <span
                className={[
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold",
                  isComplete
                    ? "bg-[var(--accent-violet)] text-white"
                    : isCurrent
                      ? "border-2 border-[var(--accent-violet-bright)] text-[var(--accent-violet-bright)]"
                      : "border border-[var(--border)]",
                ].join(" ")}
                aria-hidden
              >
                {isComplete ? "✓" : index + 1}
              </span>
              {PHASE_LABELS[step]}
            </li>
          );
        })}
      </ol>

      <p className="text-xs text-[var(--muted)]">{PHASE_LABELS[phase]}</p>
    </section>
  );
}
