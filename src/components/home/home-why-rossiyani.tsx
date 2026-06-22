import { EditorialSectionHead } from "@/components/editorial/editorial-section-head";

import { HomeIconAnalysis, HomeIconContent, HomeIconNetwork } from "./home-icons";

const PILLARS = [
  {
    id: "content",
    title: "Authentic Content",
    description: "Learn from real Russian.",
    Icon: HomeIconContent,
  },
  {
    id: "analysis",
    title: "Linguistic Analysis",
    description: "Reveal grammar, vocabulary and patterns.",
    Icon: HomeIconAnalysis,
  },
  {
    id: "network",
    title: "Knowledge Network",
    description: "Every text enriches your personal learning system.",
    Icon: HomeIconNetwork,
  },
] as const;

export function HomeWhyRossiyani() {
  return (
    <section className="home-section" aria-labelledby="home-why-heading">
      <EditorialSectionHead
        id="home-why-heading"
        icon={<HomeIconNetwork className="editorial-section-head__icon" />}
        title="Why Rossiyani"
        lead="Not a generic language app — a scholarly environment built around real texts."
      />

      <ul className="home-pillar-grid">
        {PILLARS.map((pillar) => (
          <li key={pillar.id}>
            <article className="home-pillar-card">
              <pillar.Icon className="home-pillar-card__icon" />
              <h3 className="home-pillar-card__title">{pillar.title}</h3>
              <p className="home-pillar-card__description">{pillar.description}</p>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
