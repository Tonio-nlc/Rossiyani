import Link from "next/link";

import { EditorialSectionHead } from "@/components/editorial/editorial-section-head";

import { ImportIconPipeline } from "./import-extraction-icons";

const PIPELINE_STEPS = [
  { id: "import", label: "Import", href: "/import" },
  { id: "read", label: "Lire", href: "/library" },
  { id: "explore", label: "Explorer", href: "/explorer" },
  { id: "practice", label: "Pratiquer", href: "/practice" },
] as const;

export function ImportPipeline() {
  return (
    <section
      className="import-editorial-section"
      aria-labelledby="import-pipeline-heading"
    >
      <EditorialSectionHead
        id="import-pipeline-heading"
        icon={<ImportIconPipeline className="editorial-section-head__icon" />}
        title="Parcours d'apprentissage"
        lead="Chaque texte importé alimente lecture, exploration et pratique."
      />

      <ol className="import-pipeline__flow">
        {PIPELINE_STEPS.map((step, index) => (
          <li key={step.id} className="import-pipeline__step">
            {step.id === "import" ? (
              <span className="import-pipeline__node import-pipeline__node--current">{step.label}</span>
            ) : (
              <Link href={step.href} className="import-pipeline__node focus-kb">
                {step.label}
              </Link>
            )}
            {index < PIPELINE_STEPS.length - 1 ? (
              <span className="import-pipeline__arrow" aria-hidden>
                ↓
              </span>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}
