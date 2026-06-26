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
    <section
      className={[
        "home-ws-card home-ws-report",
        animate ? "animate-success-pop" : "",
      ].join(" ")}
    >
      <div>
        <h2 className="home-ws-section__title">{successTitle}</h2>
        <p className="home-ws-report__lead">
          {report.hasPartialSegments
            ? "Certaines analyses détaillées seront générées plus tard."
            : "Votre système d'apprentissage s'est enrichi à partir de ce texte."}
        </p>
      </div>

      {report.segmentStats ? (
        <ul className="home-ws-report__note flex flex-wrap gap-x-4 gap-y-1">
          <li>✓ {report.segmentStats.complete} segment(s) analysé(s)</li>
          {(report.segmentStats.partial > 0 || report.segmentStats.failed > 0) && (
            <li>⚠ {report.segmentStats.partial + report.segmentStats.failed} segment(s) partiel(s)</li>
          )}
          {report.segmentStats.lost > 0 ? (
            <li>✗ {report.segmentStats.lost} segment(s) perdu(s)</li>
          ) : null}
        </ul>
      ) : null}

      <div>
        <p className="home-ws-metric__label">Généré</p>
        <dl className="home-ws-metric-progress__grid">
          {generatedStats.length > 0
            ? generatedStats.map((stat) => (
                <div key={stat.label}>
                  <dt>{stat.label}</dt>
                  <dd>{stat.value.toLocaleString("fr-FR")}</dd>
                </div>
              ))
            : (
              <>
                <div>
                  <dt>Phrases analysées</dt>
                  <dd>{report.sentencesProcessed.toLocaleString("fr-FR")}</dd>
                </div>
                <div>
                  <dt>Textes importés</dt>
                  <dd>{report.textsImported.toLocaleString("fr-FR")}</dd>
                </div>
              </>
            )}
        </dl>
      </div>

      {(report.textsSkipped > 0 || report.textsFailed > 0) && (
        <p className="home-ws-report__note">
          {report.textsSkipped > 0 ? `${report.textsSkipped} doublon(s) ignoré(s). ` : ""}
          {report.textsFailed > 0 ? `${report.textsFailed} échec(s).` : ""}
        </p>
      )}

      <div className="home-ws-actions">
        {completedTextId ? (
          <Link href={`/texts/${completedTextId}`} className="home-ws-btn home-ws-btn--pill focus-kb">
            Lire maintenant
          </Link>
        ) : null}
        <Link href="/library" className="home-ws-link focus-kb">
          Ouvrir dans la bibliothèque →
        </Link>
        <Link href="/vocabulary" className="home-ws-link focus-kb">
          Explorer les découvertes →
        </Link>
      </div>

      {report.quality ? <ImportQualityReportCard quality={report.quality} /> : null}
    </section>
  );
}
