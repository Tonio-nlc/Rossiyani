import Link from "next/link";

const METHODOLOGY_CARDS = [
  {
    title: "Structured Immersion",
    description:
      "Progress through Russian grammar as an architecture to be inhabited — not a checklist to memorise. Each lesson builds on the last with deliberate spacing.",
    tags: ["Syntax First", "Deep Reading"],
  },
  {
    title: "Cognitive Stamina",
    description:
      "Sustained attention to morphology and case government trains the reading mind. Short sessions, full concentration, no gamified distraction.",
    tags: ["Focus", "Endurance"],
  },
] as const;

const GRAMMAR_CASES = [
  {
    name: "Nominative",
    description: "The subject case — who or what performs the action.",
  },
  {
    name: "Genitive",
    description: "Possession, absence, and the realm of «нет» — nothing exists without it.",
  },
  {
    name: "Dative",
    description: "The indirect object — to whom, for whom, the direction of giving.",
  },
  {
    name: "Accusative",
    description: "The direct object — what receives the action of the verb.",
  },
  {
    name: "Instrumental",
    description: "Means and accompaniment — with what, by whom, together with.",
  },
  {
    name: "Prepositional",
    description: "Location and topic — about what, in what place (always with a preposition).",
  },
] as const;

function SectionIcon({ type }: { type: "methodology" | "grammar" }) {
  if (type === "methodology") {
    return (
      <svg viewBox="0 0 20 20" fill="none" aria-hidden className="manual-scholar-section__icon">
        <circle cx="10" cy="10" r="6.5" stroke="currentColor" strokeWidth="1.2" />
        <path d="M10 6.5v4l2.5 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className="manual-scholar-section__icon">
      <path d="M4 4.5h12v11H4z" stroke="currentColor" strokeWidth="1.2" />
      <path d="M7 8h6M7 11h6M7 14h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function ManualScholarHome() {
  return (
    <div className="manual-scholar-home">
      <header className="manual-scholar-hero">
        <h1 className="manual-scholar-hero__title">The Scholar&apos;s Manual</h1>
        <p className="manual-scholar-hero__lead">
          A rigorous introduction to Russian linguistic architecture — morphology, syntax, and the
          six-case system presented as a coherent scholarly framework for serious readers.
        </p>
        <div className="manual-scholar-hero__rule" aria-hidden />
      </header>

      <section className="manual-scholar-section" aria-labelledby="methodology-heading">
        <div className="manual-scholar-section__head">
          <SectionIcon type="methodology" />
          <h2 id="methodology-heading" className="manual-scholar-section__title">
            Methodology
          </h2>
        </div>

        <div className="manual-scholar-methodology">
          {METHODOLOGY_CARDS.map((card) => (
            <article key={card.title} className="manual-scholar-methodology__card">
              <h3 className="manual-scholar-methodology__card-title">{card.title}</h3>
              <p className="manual-scholar-methodology__card-text">{card.description}</p>
              <ul className="manual-scholar-methodology__tags">
                {card.tags.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <figure className="manual-scholar-figure" aria-label="Illustration éditoriale">
          <div className="manual-scholar-figure__inner" />
        </figure>
      </section>

      <section className="manual-scholar-section" aria-labelledby="grammar-heading">
        <div className="manual-scholar-section__head">
          <SectionIcon type="grammar" />
          <h2 id="grammar-heading" className="manual-scholar-section__title">
            Architectural Grammar
          </h2>
        </div>

        <p className="manual-scholar-section__intro">
          Russian declension is not a list of endings but a spatial logic. Each case answers a
          precise question about the relationship between words in a sentence. Master the questions,
          and the endings follow.
        </p>

        <div className="manual-scholar-cases">
          {GRAMMAR_CASES.map((grammarCase) => (
            <div key={grammarCase.name} className="manual-scholar-cases__row">
              <p className="manual-scholar-cases__name">{grammarCase.name}</p>
              <p className="manual-scholar-cases__desc">{grammarCase.description}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="manual-scholar-footer">
        <p className="manual-scholar-footer__copy">Rossiyani &copy; 2024 &bull; Academic Reading Room</p>
        <nav className="manual-scholar-footer__nav" aria-label="Liens institutionnels">
          <Link href="/library" className="manual-scholar-footer__link focus-kb">
            Library
          </Link>
          <Link href="/explorer" className="manual-scholar-footer__link focus-kb">
            Explorer
          </Link>
          <Link href="/practice" className="manual-scholar-footer__link focus-kb">
            Practice
          </Link>
          <Link href="/manual/theme/declensions" className="manual-scholar-footer__link focus-kb">
            Declensions
          </Link>
        </nav>
      </footer>
    </div>
  );
}
