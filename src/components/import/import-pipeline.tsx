import Link from "next/link";

const PIPELINE_STEPS = [
  { id: "import", label: "Import", href: "/import", glyph: "↑" },
  { id: "reading", label: "Lecture", href: "/library", glyph: "◫" },
  { id: "vocabulary", label: "Vocabulary", href: "/vocabulary", glyph: "◎" },
  { id: "practice", label: "Pratique", href: "/practice", glyph: "◇" },
  { id: "words", label: "Mots", href: "/vocabulary?tab=words", glyph: "Aa" },
] as const;

export function ImportPipeline() {
  return (
    <section className="home-ws-section" aria-labelledby="import-pipeline-heading">
      <div className="home-ws-section__head">
        <h2 id="import-pipeline-heading" className="home-ws-section__title">
          Parcours d&apos;apprentissage
        </h2>
        <p className="home-ws-section__subtitle">
          Chaque texte importé alimente lecture, exploration et pratique.
        </p>
      </div>

      <ol className="home-ws-journey">
        {PIPELINE_STEPS.map((step, index) => (
          <li key={step.id} className="home-ws-journey__step">
            {step.id === "import" ? (
              <span className="home-ws-journey__node home-ws-journey__node--current">
                <span className="home-ws-journey__icon" aria-hidden>
                  {step.glyph}
                </span>
                <span className="home-ws-journey__label">{step.label}</span>
              </span>
            ) : (
              <Link href={step.href} className="home-ws-journey__node focus-kb">
                <span className="home-ws-journey__icon" aria-hidden>
                  {step.glyph}
                </span>
                <span className="home-ws-journey__label">{step.label}</span>
              </Link>
            )}
            {index < PIPELINE_STEPS.length - 1 ? (
              <span className="home-ws-journey__connector" aria-hidden />
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}
