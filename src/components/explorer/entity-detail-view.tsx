import Link from "next/link";

import { practicePath } from "@/lib/practice/constants";
import type { ExplorerEntityPageData, ExplorerEntityPick } from "@/features/explorer/entity";
import { splitEditorialParagraphs } from "@/features/explorer/entity/types";

import { ExplorerLayout } from "./explorer-layout";
import { textPath } from "./explorer-routes";

type EntityDetailViewProps = {
  data: ExplorerEntityPageData;
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="home-section-label">{children}</p>;
}

function EntityBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[var(--hairline)] bg-[var(--surface)] px-3 py-1 text-xs font-medium tracking-wide text-[var(--ink-secondary)]">
      {label}
    </span>
  );
}

function EntityHero({ data }: { data: ExplorerEntityPageData }) {
  const primaryLesson = data.relatedLessons[0];

  return (
    <header className="space-y-6 pb-4">
      <div className="space-y-4">
        <p className="break-russian font-reader text-[clamp(2.5rem,6vw,4rem)] font-semibold uppercase leading-[0.98] tracking-tight text-[var(--ink)]">
          {data.label}
        </p>
        {data.translation ? (
          <p className="font-reader text-[clamp(1.125rem,2.5vw,1.5rem)] text-[var(--ink-secondary)]">
            {data.translation}
          </p>
        ) : null}
        <div className="flex flex-wrap items-center gap-2">
          <EntityBadge label={data.typeLabel} />
          {data.badges.map((badge) => (
            <EntityBadge key={badge.label} label={badge.label} />
          ))}
        </div>
        {data.heroSummary ? (
          <p className="max-w-2xl text-base leading-relaxed text-[var(--ink-secondary)]">
            {data.heroSummary}
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href={practicePath({
            structure: data.practiceStructure,
            mode: "structure",
            from: "explorer",
          })}
          className="focus-kb inline-flex items-center rounded-full bg-[var(--ink)] px-5 py-2.5 text-sm font-medium text-[var(--surface)] transition hover:opacity-90"
        >
          Practice this
        </Link>
        {primaryLesson ? (
          <Link
            href={`/manual/lecons/${primaryLesson.slug}`}
            className="focus-kb inline-flex items-center rounded-full border border-[var(--hairline)] bg-[var(--surface)] px-5 py-2.5 text-sm font-medium text-[var(--ink)] transition hover:border-[var(--ink-muted)]"
          >
            Open related lesson
          </Link>
        ) : null}
      </div>
    </header>
  );
}

function WhyItMattersBlock({ text }: { text: string }) {
  const paragraphs = splitEditorialParagraphs(text);

  return (
    <section className="rounded-3xl border border-[var(--hairline)] bg-[var(--surface)] px-6 py-7 md:px-8 md:py-9">
      <SectionLabel>Why learn this?</SectionLabel>
      <div className="mt-5 max-w-2xl space-y-4">
        {paragraphs.map((paragraph) => (
          <p key={paragraph} className="text-base leading-relaxed text-[var(--ink-secondary)]">
            {paragraph}
          </p>
        ))}
      </div>
    </section>
  );
}

function UsageBlock({ data }: { data: ExplorerEntityPageData }) {
  const hasDescription = Boolean(data.description.trim());
  const hasUsageNotes = Boolean(data.usageNotes?.trim());
  const hasMistakes = Boolean(data.commonMistakes?.trim());

  if (!hasDescription && !hasUsageNotes && !hasMistakes) {
    return null;
  }

  return (
    <section className="space-y-5">
      <SectionLabel>How Russians use it</SectionLabel>
      <div className="max-w-2xl space-y-5">
        {hasDescription ? (
          <p className="text-base leading-relaxed text-[var(--ink)]">{data.description}</p>
        ) : null}
        {hasUsageNotes ? (
          <p className="text-sm leading-relaxed text-[var(--ink-secondary)]">{data.usageNotes}</p>
        ) : null}
        {hasMistakes ? (
          <div className="rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] px-5 py-4">
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--ink-muted)]">
              Common mistakes
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ink-secondary)]">
              {data.commonMistakes}
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function ExampleCards({
  examples,
}: {
  examples: ExplorerEntityPageData["examples"];
}) {
  if (examples.length === 0) {
    return null;
  }

  return (
    <section className="space-y-5">
      <SectionLabel>Examples</SectionLabel>
      <ul className="grid gap-4 lg:grid-cols-2">
        {examples.map((example, index) => (
          <li
            key={`${example.russian}-${index}`}
            className="rounded-3xl border border-[var(--hairline)] bg-[var(--surface)] p-6 md:p-8"
          >
            <p className="break-russian font-reader text-[clamp(1.125rem,2.5vw,1.375rem)] leading-snug text-[var(--ink)]">
              {example.russian}
            </p>
            {example.translation ? (
              <p className="mt-4 text-base leading-relaxed text-[var(--ink-secondary)]">
                {example.translation}
              </p>
            ) : null}
            {example.explanation ? (
              <p className="mt-3 text-sm leading-relaxed text-[var(--ink-muted)]">
                {example.explanation}
              </p>
            ) : null}
            {example.textId && example.textTitle ? (
              <Link
                href={textPath(example.textId)}
                className="focus-kb mt-5 inline-block text-sm font-medium text-[var(--ink-muted)] transition hover:text-[var(--color-link)]"
              >
                {example.textTitle} →
              </Link>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

function RelatedExpressionCards({ items }: { items: ExplorerEntityPick[] }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="space-y-5">
      <SectionLabel>Related expressions</SectionLabel>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="focus-kb group flex h-full flex-col rounded-3xl border border-[var(--hairline)] bg-[var(--surface)] p-5 transition duration-200 hover:-translate-y-0.5 hover:border-[var(--ink-muted)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
          >
            {item.typeBadge ? (
              <span className="mb-3 inline-flex w-fit rounded-full border border-[var(--hairline)] px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[var(--ink-muted)]">
                {item.typeBadge}
              </span>
            ) : null}
            <p className="break-russian font-reader text-lg text-[var(--ink)] group-hover:text-[var(--color-link)]">
              {item.label}
            </p>
            {item.translation ? (
              <p className="mt-2 line-clamp-2 text-sm text-[var(--ink-secondary)]">
                {item.translation}
              </p>
            ) : null}
            <span className="mt-auto pt-5 text-sm font-medium text-[var(--ink-muted)] group-hover:text-[var(--color-link)]">
              Open →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function RelatedGrammarCards({ items }: { items: ExplorerEntityPick[] }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="space-y-5">
      <SectionLabel>Related grammar</SectionLabel>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="focus-kb group flex h-full flex-col rounded-3xl border border-[var(--hairline)] bg-[var(--surface)] p-5 transition duration-200 hover:-translate-y-0.5 hover:border-[var(--ink-muted)]"
          >
            <p className="font-reader text-lg text-[var(--ink)] group-hover:text-[var(--color-link)]">
              {item.label}
            </p>
            <span className="mt-auto pt-5 text-sm font-medium text-[var(--ink-muted)] group-hover:text-[var(--color-link)]">
              Open →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function FoundAcrossRossiyani({
  data,
  readExamplesHref,
}: {
  data: ExplorerEntityPageData;
  readExamplesHref: string | null;
}) {
  const primaryLesson = data.relatedLessons[0];
  const practiceHref = practicePath({
    structure: data.practiceStructure,
    mode: "structure",
    from: "explorer",
  });

  const cards = [
    primaryLesson
      ? {
          icon: "📖",
          title: "Manual",
          body: "Related lesson available",
          href: `/manual/lecons/${primaryLesson.slug}`,
          cta: "Open →",
        }
      : null,
    data.textCount > 0 && readExamplesHref
      ? {
          icon: "📚",
          title: "Reader",
          body: `Appears in ${data.textCount} text${data.textCount > 1 ? "s" : ""}`,
          href: readExamplesHref,
          cta: "Read →",
        }
      : null,
    {
      icon: "✍",
      title: "Practice",
      body: "Generate your own example",
      href: practiceHref,
      cta: "Practice →",
    },
  ].filter(Boolean) as Array<{
    icon: string;
    title: string;
    body: string;
    href: string;
    cta: string;
  }>;

  if (cards.length === 0) {
    return null;
  }

  return (
    <section className="space-y-5">
      <SectionLabel>Found across Rossiyani</SectionLabel>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="focus-kb group flex flex-col rounded-3xl border border-[var(--hairline)] bg-[var(--surface)] p-5 transition duration-200 hover:-translate-y-0.5 hover:border-[var(--ink-muted)]"
          >
            <span className="text-2xl" aria-hidden>
              {card.icon}
            </span>
            <p className="mt-4 text-sm font-medium text-[var(--ink)]">{card.title}</p>
            <p className="mt-1 text-sm text-[var(--ink-secondary)]">{card.body}</p>
            <span className="mt-auto pt-5 text-sm font-medium text-[var(--ink-muted)] group-hover:text-[var(--color-link)]">
              {card.cta}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function ReaderSection({ texts }: { texts: ExplorerEntityPageData["relatedTexts"] }) {
  if (texts.length === 0) {
    return null;
  }

  return (
    <section className="space-y-5">
      <SectionLabel>Reader</SectionLabel>
      <div className="grid gap-4 lg:grid-cols-2">
        {texts.map((text) => (
          <Link
            key={`${text.textId ?? text.russian}`}
            href={text.textId ? textPath(text.textId) : "#"}
            className="focus-kb group flex h-full flex-col rounded-3xl border border-[var(--hairline)] bg-[var(--surface)] p-5 transition duration-200 hover:-translate-y-0.5 hover:border-[var(--ink-muted)]"
          >
            {text.textTitle ? (
              <p className="text-sm font-medium text-[var(--ink)]">{text.textTitle}</p>
            ) : null}
            <p className="mt-3 flex-1 font-reader text-base leading-relaxed text-[var(--ink-secondary)]">
              {text.russian}
            </p>
            {text.textId ? (
              <span className="mt-5 text-sm font-medium text-[var(--ink-muted)] group-hover:text-[var(--color-link)]">
                Open →
              </span>
            ) : null}
          </Link>
        ))}
      </div>
    </section>
  );
}

function PracticeSection({ data }: { data: ExplorerEntityPageData }) {
  return (
    <section className="space-y-5">
      <SectionLabel>Use it yourself</SectionLabel>
      <Link
        href={practicePath({
          structure: data.practiceStructure,
          mode: "structure",
          from: "explorer",
        })}
        className="focus-kb group flex flex-col rounded-3xl border border-[var(--ink)] bg-[var(--surface)] p-8 md:p-10 transition duration-200 hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)]"
      >
        <p className="font-reader text-[clamp(1.375rem,3vw,1.75rem)] text-[var(--ink)] group-hover:text-[var(--color-link)]">
          Use this structure yourself
        </p>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-[var(--ink-secondary)]">
          Generate a sentence and receive detailed feedback.
        </p>
        <span className="mt-8 inline-flex w-fit rounded-full bg-[var(--ink)] px-5 py-2.5 text-sm font-medium text-[var(--surface)] transition group-hover:opacity-90">
          Practice now →
        </span>
      </Link>
    </section>
  );
}

function ManualSection({ lessons }: { lessons: ExplorerEntityPageData["relatedLessons"] }) {
  if (lessons.length === 0) {
    return null;
  }

  return (
    <section className="space-y-5">
      <SectionLabel>Manual</SectionLabel>
      <div className="grid gap-4 lg:grid-cols-2">
        {lessons.map((lesson) => (
          <Link
            key={lesson.slug}
            href={`/manual/lecons/${lesson.slug}`}
            className="focus-kb group flex flex-col rounded-3xl border border-[var(--hairline)] bg-[var(--surface)] p-5 transition duration-200 hover:-translate-y-0.5 hover:border-[var(--ink-muted)]"
          >
            <p className="text-sm text-[var(--ink-muted)]">Lesson</p>
            <p className="mt-2 font-reader text-lg text-[var(--ink)] group-hover:text-[var(--color-link)]">
              {lesson.title}
            </p>
            <span className="mt-5 text-sm font-medium text-[var(--ink-muted)] group-hover:text-[var(--color-link)]">
              Open lesson →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function LearnNextSection({ items }: { items: ExplorerEntityPick[] }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="space-y-5 border-t border-[var(--hairline)] pt-12">
      <SectionLabel>Learn next</SectionLabel>
      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="focus-kb group flex flex-col rounded-3xl border border-[var(--hairline)] bg-[var(--surface)] p-5 transition duration-200 hover:-translate-y-0.5 hover:border-[var(--ink-muted)]"
          >
            {item.reason ? (
              <span className="mb-3 text-xs font-medium text-[var(--ink-muted)]">
                {item.reason} →
              </span>
            ) : null}
            <p className="break-russian font-reader text-xl text-[var(--ink)] group-hover:text-[var(--color-link)]">
              {item.label}
            </p>
            {item.translation ? (
              <p className="mt-2 text-sm text-[var(--ink-secondary)]">{item.translation}</p>
            ) : null}
            <span className="mt-auto pt-5 text-sm font-medium text-[var(--ink-muted)] group-hover:text-[var(--color-link)]">
              Open →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function EntityDetailView({ data }: EntityDetailViewProps) {
  const readExamplesHref = data.relatedTexts[0]?.textId
    ? textPath(data.relatedTexts[0].textId)
    : null;

  return (
    <ExplorerLayout breadcrumb={data.breadcrumb}>
      <article className="space-y-14 pb-12 md:space-y-16">
        <EntityHero data={data} />

        {data.whyItMatters ? <WhyItMattersBlock text={data.whyItMatters} /> : null}

        <UsageBlock data={data} />

        <ExampleCards examples={data.examples} />

        <RelatedExpressionCards items={data.relatedExpressions} />

        <RelatedGrammarCards items={data.relatedGrammar} />

        <FoundAcrossRossiyani data={data} readExamplesHref={readExamplesHref} />

        <ReaderSection texts={data.relatedTexts} />

        <PracticeSection data={data} />

        <ManualSection lessons={data.relatedLessons} />

        <LearnNextSection items={data.continueExploring} />
      </article>
    </ExplorerLayout>
  );
}
