import { HomeFinalCta } from "./home-final-cta";
import { HomeHero } from "./home-hero";
import { HomeHowItWorks } from "./home-how-it-works";
import { HomeManualSection } from "./home-manual-section";
import { HomeProductPreview } from "./home-product-preview";
import { HomeWhyRossiyani } from "./home-why-rossiyani";

export function HomeLanding() {
  return (
    <div className="home-landing">
      <HomeHero />
      <HomeHowItWorks />
      <HomeWhyRossiyani />
      <HomeProductPreview />
      <HomeManualSection />
      <HomeFinalCta />
    </div>
  );
}
