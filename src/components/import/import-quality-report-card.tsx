import type { ImportSessionReport } from "@/lib/import-client";

type ImportQualityReportCardProps = {
  quality: NonNullable<ImportSessionReport["quality"]>;
};

export function ImportQualityReportCard({ quality }: ImportQualityReportCardProps) {
  return (
    <section className="import-ws-quality">
      <h3 className="import-ws-quality__label">Qualité du texte</h3>

      <ul className="import-ws-quality__list">
        <li>✓ mots connus : {quality.knownWords}</li>
        <li>✓ nouveaux mots analysés : {quality.newWordsAnalyzed}</li>
        <li className="import-ws-quality__warn">⚠ mots suspects : {quality.suspiciousWords}</li>
        <li>✕ mots ignorés : {quality.ignoredWords}</li>
      </ul>

      {quality.suspiciousTokens.length > 0 ? (
        <div className="import-ws-quality__tokens">
          {quality.suspiciousTokens.map((token) => (
            <div key={token.word} className="import-ws-quality__token">
              <p className="import-ws-quality__token-word">{token.word}</p>
              <p className="import-ws-quality__token-kind">Mot suspect</p>
              <ul className="import-ws-quality__token-reasons">
                {token.reasons.slice(0, 4).map((reason) => (
                  <li key={reason}>· {reason}</li>
                ))}
              </ul>
              <p className="import-ws-quality__token-suggestion">
                <span className="text-[var(--ink-muted)]">Suggestion : </span>
                {token.suggestion ?? "Aucune"}
              </p>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
