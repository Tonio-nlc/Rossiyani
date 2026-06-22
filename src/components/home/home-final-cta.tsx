import { PrimaryButton } from "@/components/design-system";

export function HomeFinalCta() {
  return (
    <section className="home-section home-section--cta" aria-labelledby="home-cta-heading">
      <div className="home-final-cta">
        <h2 id="home-cta-heading" className="home-final-cta__title">
          Start with a text.
        </h2>
        <p className="home-final-cta__lead">Everything else grows from it.</p>
        <div className="home-final-cta__actions">
          <PrimaryButton href="/import" variant="gold">
            Import Content
          </PrimaryButton>
          <PrimaryButton href="/reader">Start Reading</PrimaryButton>
        </div>
      </div>
    </section>
  );
}
