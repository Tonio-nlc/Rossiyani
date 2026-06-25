import type { ImportFailureDetails } from "@/lib/import-error-format";

type ImportErrorDetailsProps = {
  details: ImportFailureDetails;
};

export function ImportErrorDetails({ details }: ImportErrorDetailsProps) {
  return (
    <div className="home-ws-error">
      <p className="home-ws-error__headline">{details.headline}</p>

      <ul className="home-ws-error__checks">
        {details.checks.map((check) => (
          <li
            key={check.label}
            className={check.ok ? "" : "home-ws-error__check--fail"}
          >
            <span aria-hidden>{check.ok ? "✓ " : "✗ "}</span>
            {check.label}
          </li>
        ))}
      </ul>

      <div className="mt-4 border-t border-[var(--border)] pt-4">
        <p className="home-ws-metric__label">Étape ayant échoué : {details.failedStep}</p>
        <p className="home-ws-report__note mt-1 font-mono text-xs leading-relaxed">
          {details.technicalMessage}
        </p>
      </div>

      {details.suggestions.length > 0 ? (
        <div className="mt-4">
          <p className="home-ws-metric__label">Essayez de :</p>
          <ul className="home-ws-report__note mt-2 space-y-1">
            {details.suggestions.map((suggestion) => (
              <li key={suggestion}>· {suggestion}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
