import { EditorialSectionHead } from "@/components/editorial/editorial-section-head";

import { HomeIconExplore, HomeIconImport, HomeIconPractice, HomeIconRead } from "./home-icons";

const STEPS = [
  { id: "import", label: "Import", Icon: HomeIconImport },
  { id: "read", label: "Read", Icon: HomeIconRead },
  { id: "explore", label: "Explore", Icon: HomeIconExplore },
  { id: "practice", label: "Practice", Icon: HomeIconPractice },
] as const;

export function HomeHowItWorks() {
  return (
    <section
      className="home-section home-section--secondary"
      aria-labelledby="home-how-heading"
    >
      <EditorialSectionHead
        id="home-how-heading"
        icon={<HomeIconRead className="editorial-section-head__icon" />}
        title="How it works"
        lead="Every text becomes a path through reading, discovery and practice."
      />

      <ol className="home-flow">
        {STEPS.map((step, index) => (
          <li key={step.id} className="home-flow__step">
            <div className="home-flow__node">
              <step.Icon className="home-flow__icon" />
              <span className="home-flow__label">{step.label}</span>
            </div>
            {index < STEPS.length - 1 ? (
              <span className="home-flow__arrow" aria-hidden>
                ↓
              </span>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}
