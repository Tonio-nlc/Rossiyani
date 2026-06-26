import { Badge, Card } from "@/components/design-system";
import type { RecommendedTextCard } from "@/lib/home/pick-recommended-texts";

type HomeWorkspaceRecommendedReadingProps = {
  texts: RecommendedTextCard[];
};

export function HomeWorkspaceRecommendedReading({ texts }: HomeWorkspaceRecommendedReadingProps) {
  if (texts.length === 0) {
    return null;
  }

  return (
    <section className="lessons-section" aria-labelledby="home-ws-reading-heading">
      <div className="lessons-section__head">
        <div>
          <h2 id="home-ws-reading-heading" className="r3-title lessons-section__title">
            Activité récente
          </h2>
          <p className="r3-lead lessons-section__subtitle">
            Lectures suggérées selon votre niveau et votre historique.
          </p>
        </div>
      </div>

      <div className="lessons-grid lessons-grid--lessons">
        {texts.map((text) => (
          <Card key={text.id} href={text.href} className="lessons-lesson-card">
            <h3 className="r3-title lessons-lesson-card__title break-russian">{text.title}</h3>
            <p className="r3-lead lessons-lesson-card__desc">{text.description}</p>
            <div className="lessons-lesson-card__meta">
              <Badge tone="blue">{text.level}</Badge>
              <Badge tone="neutral">{text.estimatedMinutes} min</Badge>
            </div>
            <span className="lessons-lesson-card__cta">Ouvrir →</span>
          </Card>
        ))}
      </div>
    </section>
  );
}
