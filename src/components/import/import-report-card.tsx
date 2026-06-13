import type { ImportSessionReport } from "@/lib/import-client";

import { ImportQualityReportCard } from "./import-quality-report-card";

type ImportReportCardProps = {
  report: ImportSessionReport;
  animate?: boolean;
};

export function ImportReportCard({ report, animate = true }: ImportReportCardProps) {
  return (
    <section
      className={[
        "surface-elevated overflow-hidden rounded-3xl border border-[var(--accent-violet)]/30 shadow-[var(--shadow-glow)]",
        animate ? "animate-success-pop" : "",
      ].join(" ")}
    >
      <div className="border-b border-[var(--border)] bg-gradient-to-r from-[var(--accent-violet)]/15 to-[var(--accent-cyan)]/10 px-6 py-5 text-center">
        <h2 className="font-reader text-2xl font-semibold">
          {report.hasPartialSegments ? "Import terminé avec avertissements" : "Import terminé"}
        </h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {report.hasPartialSegments
            ? "Certaines analyses détaillées seront générées plus tard."
            : "Votre graphe linguistique s&apos;est enrichi"}
        </p>
      </div>

      {report.segmentStats ? (
        <div className="border-b border-[var(--border)] px-6 py-4">
          <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
            <li className="text-[var(--foreground)]">
              ✓ {report.segmentStats.complete} segment(s) analysé(s)
            </li>
            {(report.segmentStats.partial > 0 || report.segmentStats.failed > 0) && (
              <li className="text-amber-400">
                ⚠ {report.segmentStats.partial + report.segmentStats.failed} segment(s) partiel(s)
              </li>
            )}
            <li className={report.segmentStats.lost > 0 ? "text-red-400" : "text-[var(--muted)]"}>
              ✗ {report.segmentStats.lost} segment(s) perdu(s)
            </li>
          </ul>
        </div>
      ) : null}

      <div className="grid gap-6 p-6 sm:grid-cols-2">
        <StatBlock label="Textes importés" value={String(report.textsImported)} highlight />
        <StatBlock label="Phrases analysées" value={String(report.sentencesProcessed)} highlight />
        <StatBlock label="Knowledge hits" value={`${report.knowledgeHitPercent} %`} />
        <StatBlock label="AI calls" value={`${report.aiCallPercent} %`} />
        <StatBlock label="Concepts créés" value={String(report.conceptsCreated)} accent="cyan" />
        <StatBlock label="Collocations" value={String(report.collocationsCreated)} accent="cyan" />
      </div>

      {(report.textsSkipped > 0 || report.textsFailed > 0) && (
        <p className="border-t border-[var(--border)] px-6 py-4 text-xs text-[var(--muted)]">
          {report.textsSkipped > 0 ? `${report.textsSkipped} doublon(s) ignoré(s). ` : ""}
          {report.textsFailed > 0 ? `${report.textsFailed} échec(s).` : ""}
        </p>
      )}

      {report.quality ? <ImportQualityReportCard quality={report.quality} /> : null}
    </section>
  );
}

function StatBlock({
  label,
  value,
  highlight,
  accent,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  accent?: "cyan";
}) {
  return (
    <div
      className={[
        "rounded-2xl border px-4 py-4",
        highlight ? "border-[var(--border-strong)] bg-[var(--surface)]" : "border-[var(--border)]",
      ].join(" ")}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">{label}</p>
      <p
        className={[
          "mt-1 font-reader text-2xl font-semibold",
          accent === "cyan" ? "text-[var(--accent-cyan-bright)]" : "text-[var(--foreground)]",
        ].join(" ")}
      >
        {value}
      </p>
    </div>
  );
}
