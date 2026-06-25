import type { ImportSessionReport } from "@/lib/import-client";

type ImportQualityReportCardProps = {
  quality: NonNullable<ImportSessionReport["quality"]>;
};

export function ImportQualityReportCard({ quality }: ImportQualityReportCardProps) {
  return (
    <section className="home-ws-quality">
      <h3 className="home-ws-metric__label">Qualité du texte</h3>

      <ul className="home-ws-quality__list">
        <li>✓ mots connus : {quality.knownWords}</li>
        <li>✓ nouveaux mots analysés : {quality.newWordsAnalyzed}</li>
        <li>⚠ mots suspects : {quality.suspiciousWords}</li>
        <li>✕ mots ignorés : {quality.ignoredWords}</li>
      </ul>

      {quality.suspiciousTokens.length > 0 ? (
        <div className="mt-4 space-y-3">
          {quality.suspiciousTokens.map((token) => (
            <div key={token.word} className="home-ws-quality__token">
              <p className="home-ws-card-title">{token.word}</p>
              <p className="home-ws-metric__label mt-1">Mot suspect</p>
              <ul className="home-ws-report__note mt-2 space-y-0.5">
                {token.reasons.slice(0, 4).map((reason) => (
                  <li key={reason}>· {reason}</li>
                ))}
              </ul>
              <p className="home-ws-explore-hub__description mt-2">
                <span className="home-ws-report__note">Suggestion : </span>
                {token.suggestion ?? "Aucune"}
              </p>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
