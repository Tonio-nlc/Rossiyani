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
    <section className="home-ws-card home-ws-extract animate-fade-up" aria-live="polite" aria-busy={phase !== "done"}>
      <div>
        <p className="home-ws-metric__label">Préparation du fichier</p>
        <p className="home-ws-card-title break-russian font-reader">{fileName}</p>
        {totalFiles > 1 ? (
          <p className="home-ws-explore-hub__description">
            Fichier {fileIndex} sur {totalFiles}
          </p>
        ) : null}
      </div>

      <ol className="home-ws-extract__steps">
        {steps.slice(0, -1).map((step, index) => {
          const isComplete = index < currentIndex;
          const isCurrent = step === phase;
          return (
            <li
              key={step}
              className={[
                "home-ws-extract__step",
                isCurrent ? "home-ws-extract__step--current" : "",
                isComplete ? "home-ws-extract__step--done" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <span className="home-ws-extract__dot" aria-hidden>
                {isComplete ? "✓" : index + 1}
              </span>
              {PHASE_LABELS[step]}
            </li>
          );
        })}
      </ol>

      <p className="home-ws-report__note">{PHASE_LABELS[phase]}</p>
    </section>
  );
}
