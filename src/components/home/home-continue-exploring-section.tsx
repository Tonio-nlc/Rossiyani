import Link from "next/link";

import type { TodaysDiscovery } from "@/features/discovery";
import type { HomeFeaturedLesson } from "@/features/home";
import {
  continueExploringExplorerRationale,
  continueExploringLessonRationale,
} from "@/lib/home/session-rationale";

import { HomeFeaturedLessonSync } from "./home-featured-lesson-sync";
import { HomeSessionCard } from "./home-session-card";

type HomeContinueExploringSectionProps = {
  lesson: HomeFeaturedLesson;
  discovery: TodaysDiscovery | null;
};

export function HomeContinueExploringSection({
  lesson,
  discovery,
}: HomeContinueExploringSectionProps) {
  return (
    <section aria-labelledby="home-continue-exploring">
      <HomeFeaturedLessonSync slug={lesson.slug} dateKey={lesson.dateKey} />

      <div
        id="home-continue-exploring"
        className="grid grid-cols-1 gap-[var(--layout-gap)] sm:grid-cols-2 sm:items-stretch [&>*]:h-full"
      >
        {discovery ? (
          <HomeSessionCard
            label="Poursuivre l'exploration"
            rationale={continueExploringExplorerRationale(discovery)}
            href={discovery.explorerHref}
            cta="Explorer dans le graphe →"
          >
            <h3 className="break-russian font-reader text-xl leading-snug text-[var(--ink)]">
              {discovery.displayLabel}
            </h3>
            <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-[var(--ink-secondary)]">
              {discovery.subtitle}
            </p>
          </HomeSessionCard>
        ) : null}

        <HomeSessionCard
          label={discovery ? "Leçon du fil" : "Poursuivre l'exploration"}
          rationale={continueExploringLessonRationale(lesson, discovery)}
          href={lesson.href}
          cta="Ouvrir la leçon →"
        >
          <h3 className="font-reader text-xl leading-snug text-[var(--ink)]">{lesson.title}</h3>
          <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-[var(--ink-secondary)]">
            {lesson.description}
          </p>
          <p className="mt-2 text-metadata text-[var(--ink-muted)]">
            {lesson.levelLabel} · {lesson.readingMinutes} min
          </p>
        </HomeSessionCard>
      </div>

      {discovery ? (
        <p className="mt-4 text-sm text-[var(--ink-muted)]">
          <Link
            href={discovery.readExamplesHref}
            className="focus-kb text-[var(--ink-secondary)] hover:text-[var(--ink)]"
          >
            Voir des exemples dans vos textes →
          </Link>
        </p>
      ) : null}
    </section>
  );
}
