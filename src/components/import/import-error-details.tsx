import type { ImportFailureDetails } from "@/lib/import-error-format";

type ImportErrorDetailsProps = {
  details: ImportFailureDetails;
};

export function ImportErrorDetails({ details }: ImportErrorDetailsProps) {
  return (
    <div className="mt-3 space-y-3 rounded-xl border border-red-500/25 bg-red-950/20 px-4 py-3">
      <p className="text-sm font-medium text-[var(--foreground)]">{details.headline}</p>

      <ul className="space-y-1 text-xs text-[var(--muted)]">
        {details.checks.map((check) => (
          <li key={check.label} className="flex items-start gap-2">
            <span className={check.ok ? "text-emerald-300" : "text-red-300"} aria-hidden>
              {check.ok ? "✓" : "✗"}
            </span>
            <span>{check.label}</span>
          </li>
        ))}
      </ul>

      <div className="border-t border-red-500/15 pt-2">
        <p className="text-[10px] font-bold uppercase tracking-wide text-red-200/80">
          Étape ayant échoué : {details.failedStep}
        </p>
        <p className="mt-1 font-mono text-[11px] leading-relaxed text-red-200/70">
          {details.technicalMessage}
        </p>
      </div>

      {details.suggestions.length > 0 ? (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--muted)]">
            Essayez de :
          </p>
          <ul className="mt-1.5 space-y-1 text-xs text-[var(--muted)]">
            {details.suggestions.map((suggestion) => (
              <li key={suggestion}>· {suggestion}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
