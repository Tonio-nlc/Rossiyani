import type { ImportFailureDetails } from "@/lib/import-error-format";

type ImportErrorDetailsProps = {
  details: ImportFailureDetails;
};

export function ImportErrorDetails({ details }: ImportErrorDetailsProps) {
  return (
    <div className="import-ws-error">
      <p className="import-ws-error__headline">{details.headline}</p>

      <ul className="import-ws-error__checks">
        {details.checks.map((check) => (
          <li
            key={check.label}
            className={check.ok ? "import-ws-error__check--ok" : "import-ws-error__check--fail"}
          >
            <span aria-hidden>{check.ok ? "✓ " : "✗ "}</span>
            {check.label}
          </li>
        ))}
      </ul>

      <div className="import-ws-error__divider">
        <p className="import-ws-error__step">Étape ayant échoué : {details.failedStep}</p>
        <p className="import-ws-error__technical">{details.technicalMessage}</p>
      </div>

      {details.suggestions.length > 0 ? (
        <div>
          <p className="import-ws-error__suggest-label">Essayez de :</p>
          <ul className="import-ws-error__suggest-list">
            {details.suggestions.map((suggestion) => (
              <li key={suggestion}>· {suggestion}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
