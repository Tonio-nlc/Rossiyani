"use client";

import Link from "next/link";

import { Card, PrimaryButton } from "@/components/design-system";
import type { HomeReviewPrompt } from "@/lib/home/build-home-session";

type HomeWorkspaceReviewProps = {
  review: HomeReviewPrompt;
};

export function HomeWorkspaceReview({ review }: HomeWorkspaceReviewProps) {
  return (
    <section className="lessons-section" aria-labelledby="home-review-heading">
      <div className="lessons-section__head">
        <h2 id="home-review-heading" className="r3-title lessons-section__title">
          Révisions du jour
        </h2>
      </div>

      <Card as="article" interactive className="home-ws-review-card ws-card">
        <div className="ws-card__body">
          <p className="home-ws-review-card__count">
            {review.dueCount} carte{review.dueCount > 1 ? "s" : ""} à réviser
          </p>
          <p className="home-ws-review-card__time">
            Environ {review.estimatedMinutes} min · session courte
          </p>
        </div>
        <footer className="ws-card__footer">
          <PrimaryButton href="/review" className="home-ws-review-card__cta">
            Commencer →
          </PrimaryButton>
        </footer>
      </Card>
    </section>
  );
}
