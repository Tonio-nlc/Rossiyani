import Link from "next/link";

import { practicePath } from "@/lib/practice/constants";
import type { ExplorerEntityPageData } from "@/features/explorer/entity";

import { ExplorerDiscoveryGrid } from "./explorer-discovery-grid";
import { ExplorerLayout } from "./explorer-layout";
import { textPath } from "./explorer-routes";

type EntityDetailViewProps = {
  data: ExplorerEntityPageData;
};

function JourneySection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <p className="home-section-label">{label}</p>
      {children}
    </section>
  );
}

export function EntityDetailView({ data }: EntityDetailViewProps) {
  const readExamplesHref = data.relatedTexts[0]?.textId
    ? textPath(data.relatedTexts[0].textId)
    : null;
  const primaryLesson = data.relatedLessons[0];

  return (
    <ExplorerLayout breadcrumb={data.breadcrumb}>
      <article className="space-y-12 pb-8">
        <header className="space-y-4">
          <p className="break-russian font-reader text-[clamp(2.25rem,5vw,3.5rem)] font-semibold leading-[1.02] tracking-tight text-[var(--ink)]">
            {data.label}
          </p>
          {data.translation ? (
            <p className="font-reader text-xl text-[var(--ink-secondary)]">{data.translation}</p>
          ) : null}
          <p className="text-sm text-[var(--ink-muted)]">{data.metadataLine}</p>

          <ul className="flex flex-wrap gap-x-6 gap-y-2 pt-1 text-sm font-medium">
            {readExamplesHref ? (
              <li>
                <Link
                  href={readExamplesHref}
                  className="focus-kb text-[var(--ink)] underline-offset-2 hover:underline"
                >
                  Read examples →
                </Link>
              </li>
            ) : null}
            <li>
              <Link
                href={practicePath({
                  structure: data.practiceStructure,
                  mode: "structure",
                  from: "explorer",
                })}
                className="focus-kb text-[var(--ink)] underline-offset-2 hover:underline"
              >
                Practice this →
              </Link>
            </li>
            {primaryLesson ? (
              <li>
                <Link
                  href={`/manual/lecons/${primaryLesson.slug}`}
                  className="focus-kb text-[var(--ink)] underline-offset-2 hover:underline"
                >
                  Open lesson →
                </Link>
              </li>
            ) : null}
          </ul>
        </header>

        <JourneySection label="Description">
          <p className="max-w-2xl text-sm leading-relaxed text-[var(--ink-secondary)]">
            {data.description}
          </p>
        </JourneySection>

        {data.examples.length > 0 ? (
          <JourneySection label="Examples">
            <ul className="grid gap-3 lg:grid-cols-2">
              {data.examples.map((example, index) => (
                <li
                  key={`${example.russian}-${index}`}
                  className="rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] p-4"
                >
                  <p className="break-russian font-reader text-sm leading-relaxed text-[var(--ink)]">
                    {example.russian}
                  </p>
                  {example.translation ? (
                    <p className="mt-2 text-sm leading-relaxed text-[var(--ink-secondary)]">
                      {example.translation}
                    </p>
                  ) : null}
                  {example.textId && example.textTitle ? (
                    <Link
                      href={textPath(example.textId)}
                      className="focus-kb mt-3 inline-block text-xs font-medium text-[var(--ink-muted)] hover:text-[var(--color-link)]"
                    >
                      {example.textTitle} →
                    </Link>
                  ) : null}
                </li>
              ))}
            </ul>
          </JourneySection>
        ) : null}

        {data.relatedExpressions.length > 0 ? (
          <JourneySection label="Related expressions">
            <ExplorerDiscoveryGrid items={data.relatedExpressions} />
          </JourneySection>
        ) : null}

        {data.relatedGrammar.length > 0 ? (
          <JourneySection label="Related grammar">
            <ExplorerDiscoveryGrid items={data.relatedGrammar} />
          </JourneySection>
        ) : null}

        {data.relatedTexts.length > 0 ? (
          <JourneySection label="Reader">
            <p className="text-sm text-[var(--ink-secondary)]">
              Texts containing this {data.kind === "concept" ? "pattern" : "structure"}
            </p>
            <div className="grid gap-3 lg:grid-cols-2">
              {data.relatedTexts.map((text) => (
                <Link
                  key={`${text.textId ?? text.russian}`}
                  href={text.textId ? textPath(text.textId) : "#"}
                  className="focus-kb group flex h-full flex-col rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] p-4 transition hover:border-[var(--ink-muted)]"
                >
                  {text.textTitle ? (
                    <p className="text-sm font-medium text-[var(--ink)]">{text.textTitle}</p>
                  ) : null}
                  <p className="mt-2 flex-1 font-reader text-sm leading-relaxed text-[var(--ink-secondary)]">
                    {text.russian}
                  </p>
                  {text.textId ? (
                    <span className="mt-4 text-sm font-medium text-[var(--ink-muted)] group-hover:text-[var(--color-link)]">
                      Open →
                    </span>
                  ) : null}
                </Link>
              ))}
            </div>
          </JourneySection>
        ) : null}

        <JourneySection label="Practice">
          <Link
            href={practicePath({
              structure: data.practiceStructure,
              mode: "structure",
              from: "explorer",
            })}
            className="focus-kb group flex flex-col rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] p-5 transition hover:border-[var(--ink-muted)]"
          >
            <p className="font-reader text-lg text-[var(--ink)] group-hover:text-[var(--color-link)]">
              Generate your own sentence
            </p>
            <p className="mt-2 text-sm text-[var(--ink-secondary)]">
              Use <span className="font-reader">{data.label}</span> in context and get feedback.
            </p>
            <span className="mt-4 text-sm font-medium text-[var(--ink-muted)] group-hover:text-[var(--color-link)]">
              Practice →
            </span>
          </Link>
        </JourneySection>

        {data.relatedLessons.length > 0 ? (
          <JourneySection label="Manual">
            {data.relatedLessons.map((lesson) => (
              <Link
                key={lesson.slug}
                href={`/manual/lecons/${lesson.slug}`}
                className="focus-kb group flex flex-col rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] p-5 transition hover:border-[var(--ink-muted)]"
              >
                <p className="text-sm text-[var(--ink-muted)]">Lesson</p>
                <p className="mt-1 font-reader text-lg text-[var(--ink)] group-hover:text-[var(--color-link)]">
                  {lesson.title}
                </p>
                <span className="mt-3 text-sm font-medium text-[var(--ink-muted)] group-hover:text-[var(--color-link)]">
                  Open lesson →
                </span>
              </Link>
            ))}
          </JourneySection>
        ) : null}

        {data.continueExploring.length > 0 ? (
          <JourneySection label="Continue exploring">
            <ExplorerDiscoveryGrid items={data.continueExploring} />
          </JourneySection>
        ) : null}
      </article>
    </ExplorerLayout>
  );
}
