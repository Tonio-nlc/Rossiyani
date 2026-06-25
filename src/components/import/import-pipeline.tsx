import Link from "next/link";

const PIPELINE_STEPS = [
  { id: "import", label: "Import", href: "/import", glyph: "↑" },
  { id: "reading", label: "Lecture", href: "/library", glyph: "◫" },
  { id: "explorer", label: "Explorer", href: "/explorer", glyph: "◎" },
  { id: "practice", label: "Pratique", href: "/practice", glyph: "◇" },
  { id: "vocabulary", label: "Vocabulaire", href: "/explorer/lemmas", glyph: "Aa" },
] as const;

export function ImportPipeline() {
  return (
    <section className="import-ws-section" aria-labelledby="import-pipeline-heading">
      <div className="import-ws-section__head">
        <h2 id="import-pipeline-heading" className="import-ws-section__title">
          Parcours d&apos;apprentissage
        </h2>
        <p className="import-ws-section__lead">
          Chaque texte importé alimente lecture, exploration et pratique.
        </p>
      </div>

      <ol className="import-ws-pipeline__track">
        {PIPELINE_STEPS.map((step, index) => (
          <li key={step.id} className="import-ws-pipeline__step">
            {step.id === "import" ? (
              <span className="import-ws-pipeline__node import-ws-pipeline__node--current">
                <span className="import-ws-pipeline__icon" aria-hidden>
                  {step.glyph}
                </span>
                <span className="import-ws-pipeline__label">{step.label}</span>
              </span>
            ) : (
              <Link href={step.href} className="import-ws-pipeline__node focus-kb">
                <span className="import-ws-pipeline__icon" aria-hidden>
                  {step.glyph}
                </span>
                <span className="import-ws-pipeline__label">{step.label}</span>
              </Link>
            )}
            {index < PIPELINE_STEPS.length - 1 ? (
              <span className="import-ws-pipeline__connector" aria-hidden />
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}
