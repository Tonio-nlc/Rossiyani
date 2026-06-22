import Link from "next/link";

const PIPELINE_STEPS = [
  { id: "import", label: "Import", href: "/import" },
  { id: "read", label: "Lire", href: "/library" },
  { id: "explore", label: "Explorer", href: "/explorer" },
  { id: "practice", label: "Pratiquer", href: "/practice" },
] as const;

export function ImportPipeline() {
  return (
    <section className="import-pipeline" aria-labelledby="import-pipeline-heading">
      <h2 id="import-pipeline-heading" className="import-section-label">
        Parcours d&apos;apprentissage
      </h2>
      <p className="import-pipeline__lead">
        Chaque texte importé alimente lecture, exploration et pratique.
      </p>
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
