import Link from "next/link";

import type { ImportSessionReport } from "@/lib/import-client";

import { ImportQualityReportCard } from "./import-quality-report-card";

type ImportReportCardProps = {
  report: ImportSessionReport;
  animate?: boolean;
  completedTextId?: string | null;
};

export function ImportReportCard({
  report,
  animate = true,
  completedTextId,
}: ImportReportCardProps) {
  const successTitle = report.hasPartialSegments
    ? "Contenu ajouté — analyse partielle"
    : "Contenu ajouté avec succès";

  const generatedStats = [
    { label: "Lemmes", value: report.lemmasCreated },
    { label: "Concepts", value: report.conceptsCreated },
    { label: "Collocations", value: report.collocationsCreated },
    { label: "Expressions", value: report.expressionsCreated },
  ].filter((stat) => stat.value > 0);

  return (
    <section className={["import-report", animate ? "import-report--animate" : ""].join(" ")}>
      <header className="import-report__header">
        <h2 className="import-report__title">{successTitle}</h2>
        <p className="import-report__subtitle">
          {report.hasPartialSegments
            ? "Certaines analyses détaillées seront générées plus tard."
            : "Votre système d'apprentissage s'est enrichi à partir de ce texte."}
        </p>
      </header>

      {report.segmentStats ? (
        <div className="import-report__warnings">
          <ul className="flex flex-wrap gap-x-4 gap-y-1">
            <li>✓ {report.segmentStats.complete} segment(s) analysé(s)</li>
            {(report.segmentStats.partial > 0 || report.segmentStats.failed > 0) && (
              <li>⚠ {report.segmentStats.partial + report.segmentStats.failed} segment(s) partiel(s)</li>
            )}
            {report.segmentStats.lost > 0 ? (
              <li>✗ {report.segmentStats.lost} segment(s) perdu(s)</li>
            ) : null}
          </ul>
        </div>
      ) : null}

      {generatedStats.length > 0 ? (
        <div className="import-report__generated">
          <p className="import-report__generated-label">Généré</p>
          <dl className="import-report__stats">
            {generatedStats.map((stat) => (
              <div key={stat.label} className="import-report__stat">
                <dt>{stat.label}</dt>
                <dd>{stat.value.toLocaleString("fr-FR")}</dd>
              </div>
            ))}
          </dl>
        </div>
      ) : (
        <div className="import-report__generated">
          <p className="import-report__generated-label">Généré</p>
          <dl className="import-report__stats">
            <div className="import-report__stat">
              <dt>Phrases analysées</dt>
              <dd>{report.sentencesProcessed.toLocaleString("fr-FR")}</dd>
            </div>
            <div className="import-report__stat">
              <dt>Textes importés</dt>
              <dd>{report.textsImported.toLocaleString("fr-FR")}</dd>
            </div>
          </dl>
        </div>
      )}

      {(report.textsSkipped > 0 || report.textsFailed > 0) && (
        <p className="import-report__warnings">
          {report.textsSkipped > 0 ? `${report.textsSkipped} doublon(s) ignoré(s). ` : ""}
          {report.textsFailed > 0 ? `${report.textsFailed} échec(s).` : ""}
        </p>
      )}

      <div className="import-report__actions">
        {completedTextId ? (
          <Link href={`/texts/${completedTextId}`} className="import-ws-btn focus-kb">
            Lire maintenant
          </Link>
        ) : null}
        <Link href="/library" className="import-ws-link focus-kb">
          Ouvrir dans la bibliothèque →
        </Link>
        <Link href="/explorer" className="import-ws-link focus-kb">
          Explorer les découvertes →
        </Link>
      </div>

      {report.quality ? <ImportQualityReportCard quality={report.quality} /> : null}
    </section>
  );
}
