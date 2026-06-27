import { Badge, Card } from "@/components/design-system";
import type { HomeJourneyCard } from "@/lib/home/pick-home-journey-texts";

type HomeWorkspaceJourneyProps = {
  texts: HomeJourneyCard[];
};

export function HomeWorkspaceJourney({ texts }: HomeWorkspaceJourneyProps) {
  if (texts.length === 0) {
    return null;
  }

  return (
    <section className="lessons-section" aria-labelledby="home-journey-heading">
      <div className="lessons-section__head">
        <div>
          <h2 id="home-journey-heading" className="r3-title lessons-section__title">
            Continuer votre parcours
          </h2>
          <p className="r3-lead lessons-section__subtitle">
            Quelques lectures adaptées à votre niveau et à votre historique.
          </p>
        </div>
      </div>

      <div className="lessons-grid lessons-grid--lessons ws-card-grid ws-card-grid--items">
        {texts.map((text) => (
          <div key={text.id} className="ws-card-grid__cell">
            <Card href={text.href} className="lessons-lesson-card ws-card">
              <div className="ws-card__body">
                <h3 className="r3-title ws-card__title lessons-lesson-card__title break-russian">
                  {text.title}
                </h3>
                <p className="r3-lead ws-card__desc lessons-lesson-card__desc">{text.description}</p>
              </div>
              <div className="ws-card__meta lessons-lesson-card__meta">
                <Badge tone="blue">{text.level}</Badge>
                <Badge tone="neutral">{text.estimatedMinutes} min</Badge>
                {text.progressPercent > 0 && text.progressPercent < 100 ? (
                  <Badge tone="green">{text.progressPercent} %</Badge>
                ) : null}
              </div>
              <footer className="ws-card__footer">
                <span className="lessons-lesson-card__cta">Ouvrir →</span>
              </footer>
            </Card>
          </div>
        ))}
      </div>
    </section>
  );
}
