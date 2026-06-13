"use client";

export type KnowledgeNavStep =
  | { type: "text" }
  | { type: "word"; label: string }
  | { type: "lemma"; label: string }
  | { type: "concept"; label: string; conceptKey: string }
  | { type: "examples" }
  | { type: "related-texts" };

type KnowledgeBreadcrumbProps = {
  steps: KnowledgeNavStep[];
  onNavigate: (index: number) => void;
};

export function KnowledgeBreadcrumb({ steps, onNavigate }: KnowledgeBreadcrumbProps) {
  if (steps.length <= 1) {
    return null;
  }

  return (
    <nav aria-label="Navigation linguistique" className="flex flex-wrap items-center gap-1 text-xs">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        const label = stepLabel(step);
        return (
          <span key={`${step.type}-${index}`} className="flex items-center gap-1">
            {index > 0 ? <span className="text-neutral-500">→</span> : null}
            {isLast ? (
              <span className="font-semibold text-neutral-200">{label}</span>
            ) : (
              <button
                type="button"
                onClick={() => onNavigate(index)}
                className="focus-kb rounded px-1 py-0.5 text-neutral-400 transition hover:text-white"
              >
                {label}
              </button>
            )}
          </span>
        );
      })}
    </nav>
  );
}

function stepLabel(step: KnowledgeNavStep): string {
  switch (step.type) {
    case "text":
      return "Texte";
    case "word":
      return step.label;
    case "lemma":
      return step.label;
    case "concept":
      return step.label;
    case "examples":
      return "Exemples";
    case "related-texts":
      return "Textes liés";
    default:
      return "";
  }
}
