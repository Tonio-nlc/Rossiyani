import type { ImportSessionReport } from "@/lib/import-client";

type ImportQualityReportCardProps = {
  quality: NonNullable<ImportSessionReport["quality"]>;
};

export function ImportQualityReportCard({ quality }: ImportQualityReportCardProps) {
  return (
    <section className="border-t border-[var(--border)] px-6 py-5">
      <h3 className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--muted)]">
        Qualité du texte
      </h3>

      <ul className="mt-3 space-y-1.5 text-sm text-[var(--foreground)]">
        <li>✓ mots connus : {quality.knownWords}</li>
        <li>✓ nouveaux mots analysés : {quality.newWordsAnalyzed}</li>
        <li className="text-amber-200/90">⚠ mots suspects : {quality.suspiciousWords}</li>
        <li className="text-[var(--muted)]">✕ mots ignorés : {quality.ignoredWords}</li>
      </ul>

      {quality.suspiciousTokens.length > 0 ? (
        <div className="mt-4 space-y-3">
          {quality.suspiciousTokens.map((token) => (
            <div
              key={token.word}
              className="rounded-xl border border-amber-500/25 bg-amber-500/5 px-3 py-2.5"
            >
              <p className="font-reader text-base font-semibold text-[var(--foreground)]">
                {token.word}
              </p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-amber-200/90">
                Mot suspect
              </p>
              <ul className="mt-2 space-y-0.5 text-xs text-[var(--muted)]">
                {token.reasons.slice(0, 4).map((reason) => (
                  <li key={reason}>· {reason}</li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-[var(--foreground)]">
                <span className="text-[var(--muted)]">Suggestion : </span>
                {token.suggestion ?? "Aucune"}
              </p>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
