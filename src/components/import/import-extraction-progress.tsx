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
      className="import-ws-extract animate-fade-up"
      aria-live="polite"
      aria-busy={phase !== "done"}
    >
      <div>
        <p className="import-ws-extract__label">Préparation du fichier</p>
        <p className="import-ws-extract__file">{fileName}</p>
        {totalFiles > 1 ? (
          <p className="import-ws-extract__meta">
            Fichier {fileIndex} sur {totalFiles}
          </p>
        ) : null}
      </div>

      <ol className="import-ws-extract__steps">
        {steps.slice(0, -1).map((step, index) => {
          const isComplete = index < currentIndex;
          const isCurrent = step === phase;
          return (
            <li
              key={step}
              className={[
                "import-ws-extract__step",
                isCurrent ? "import-ws-extract__step--current" : "",
                isComplete ? "import-ws-extract__step--done" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <span className="import-ws-extract__dot" aria-hidden>
                {isComplete ? "✓" : index + 1}
              </span>
              {PHASE_LABELS[step]}
            </li>
          );
        })}
      </ol>

      <p className="import-ws-extract__status">{PHASE_LABELS[phase]}</p>
    </section>
  );
}
