"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { Reference } from "@/components/editorial";
import type { ComposeAnalysis, ComposeAlternative, ComposeVerdict } from "@/lib/compose/types";
import { COMPOSE_VERDICT_LABELS, PRACTICE_REWRITE_PRESETS } from "@/lib/compose/types";

type RewriteResult = {
  id: string;
  shortTitle: string;
  text: string;
  explanation: string;
};

const VERDICT_HEADLINE: Record<ComposeVerdict, string> = {
  natural: "Sentence accepted",
  correct: "Sentence accepted",
  unusual: "Understandable, but unusual",
  needs_correction: "Needs correction",
};

const VERDICT_BADGE: Record<ComposeVerdict, string> = {
  natural: "Natural",
  correct: "Correct",
  unusual: "Review suggested",
  needs_correction: "Needs work",
};

const REWRITE_CARD_META: Record<
  string,
  { icon: string; title: string; description: string }
> = {
  natural: {
    icon: "✨",
    title: "More natural",
    description: "Sound like an educated native.",
  },
  conversational: {
    icon: "🗣",
    title: "More conversational",
    description: "Everyday spoken Russian.",
  },
  literary: {
    icon: "📚",
    title: "More literary",
    description: "Formal written style.",
  },
  different: {
    icon: "🔄",
    title: "Express differently",
    description: "Alternative construction.",
  },
};

type PracticeAnalysisViewProps = {
  analysis: ComposeAnalysis;
  expandedBlocks: Record<string, boolean>;
  onToggleBlock: (id: string) => void;
  onRewrite: (presetId: string, instruction: string, shortTitle: string) => Promise<void>;
  rewriting: string | null;
  openRewriteId: string | null;
  rewriteResult: RewriteResult | null;
  rewriteSaved: boolean;
  saved: boolean;
  onSave: () => void;
  onSaveRewrite: (text: string) => void;
  onPracticeAgain: (text: string) => void;
  onPracticeAnother: () => void;
};

export function PracticeAnalysisView(props: PracticeAnalysisViewProps) {
  const { analysis } = props;
  const primaryStructure = analysis.structures[0];
  const structureHref = primaryStructure?.href ?? "/explorer";

  return (
    <div className="space-y-[var(--layout-section-gap)] pb-[var(--space-7)]">
      <ResultHero analysis={analysis} />

      {analysis.alternatives.length > 0 ? (
        <AlternativesSection alternatives={analysis.alternatives} />
      ) : null}

      {analysis.linguisticBlocks.length > 0 ? (
        <LinguisticGridSection
          blocks={analysis.linguisticBlocks}
          expandedBlocks={props.expandedBlocks}
          onToggleBlock={props.onToggleBlock}
        />
      ) : null}

      {analysis.structures.length > 0 ? (
        <StructuresSection structures={analysis.structures} />
      ) : null}

      {analysis.relatedExpressions?.length ? (
        <RelatedExpressionsSection expressions={analysis.relatedExpressions} />
      ) : null}

      <RewriteSection
        onRewrite={props.onRewrite}
        rewriting={props.rewriting}
        openRewriteId={props.openRewriteId}
        rewriteResult={props.rewriteResult}
        rewriteSaved={props.rewriteSaved}
        primaryStructureHref={primaryStructure?.href}
        onSaveRewrite={props.onSaveRewrite}
        onPracticeAgain={props.onPracticeAgain}
      />

      <ContinueLearningSection
        structureHref={structureHref}
        saved={props.saved}
        onSave={props.onSave}
        onPracticeAnother={props.onPracticeAnother}
      />
    </div>
  );
}

function ResultHero({ analysis }: { analysis: ComposeAnalysis }) {
  const isPositive = analysis.verdict === "natural" || analysis.verdict === "correct";

  return (
    <section
      className={`rounded-sm border px-6 py-8 sm:px-8 sm:py-10 ${
        isPositive
          ? "border-[var(--hairline-strong)] bg-[var(--paper)]"
          : "border-[var(--hairline)] bg-[var(--surface-muted,#fafafa)]"
      }`}
    >
      <p className="font-reader text-[clamp(2rem,5vw,2.75rem)] leading-none tracking-tight text-[var(--ink)]">
        {COMPOSE_VERDICT_LABELS[analysis.verdict]}
      </p>
      <p className="mt-3 font-reader text-lg text-[var(--ink)]">{VERDICT_HEADLINE[analysis.verdict]}</p>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[var(--ink-secondary)]">
        {analysis.summary}
      </p>
      <div className="mt-6 flex flex-wrap gap-2">
        <span className="inline-flex items-center rounded-full border border-[var(--hairline)] px-3 py-1 text-xs font-medium tracking-wide text-[var(--ink-secondary)]">
          {VERDICT_BADGE[analysis.verdict]}
        </span>
      </div>
    </section>
  );
}

function AlternativesSection({ alternatives }: { alternatives: ComposeAlternative[] }) {
  return (
    <AnalysisSection title="Native alternatives">
      <ul className="grid gap-3 sm:grid-cols-2">
        {alternatives.map((alt) => (
          <li
            key={`${alt.register}-${alt.text}`}
            className="group rounded-sm border border-[var(--hairline)] px-4 py-4 transition hover:border-[var(--hairline-strong)]"
          >
            <span className="inline-flex rounded-full border border-[var(--hairline)] px-2.5 py-0.5 text-xs font-medium capitalize tracking-wide text-[var(--ink-muted)]">
              {alt.register}
            </span>
            <p className="break-russian mt-3 font-reader text-base leading-relaxed text-[var(--ink)]">
              {alt.text}
            </p>
          </li>
        ))}
      </ul>
    </AnalysisSection>
  );
}

function LinguisticGridSection({
  blocks,
  expandedBlocks,
  onToggleBlock,
}: {
  blocks: ComposeAnalysis["linguisticBlocks"];
  expandedBlocks: Record<string, boolean>;
  onToggleBlock: (id: string) => void;
}) {
  return (
    <AnalysisSection title="Why this works">
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {blocks.map((block) => {
          const expanded = expandedBlocks[block.id];
          const truncated = !expanded && block.note.length > 120;
          const note = expanded ? block.note : block.note.slice(0, 120);

          return (
            <li
              key={block.id}
              className="rounded-sm border border-[var(--hairline)] bg-[var(--paper)] px-4 py-4"
            >
              <p className="text-sm font-medium text-[var(--ink)]">{block.category}</p>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ink-secondary)]">
                {note}
                {truncated ? "…" : ""}
              </p>
              {block.note.length > 120 ? (
                <button
                  type="button"
                  onClick={() => onToggleBlock(block.id)}
                  className="focus-kb mt-3 text-sm text-[var(--ink-secondary)] transition hover:text-[var(--ink)]"
                >
                  {expanded ? "Collapse" : "Read more →"}
                </button>
              ) : null}
            </li>
          );
        })}
      </ul>
    </AnalysisSection>
  );
}

function StructuresSection({ structures }: { structures: ComposeAnalysis["structures"] }) {
  return (
    <section className="rounded-sm border border-[var(--hairline)] bg-[var(--surface-muted,#fafafa)] px-5 py-6 sm:px-6">
      <p className="home-section-label">Detected structures</p>
      <ul className="mt-4 flex flex-wrap gap-2.5">
        {structures.map((structure) => (
          <li key={structure.href}>
            <Link
              href={structure.href}
              className="focus-kb inline-block rounded-full border border-[var(--hairline)] bg-[var(--paper)] px-3 py-1.5 font-reader text-sm text-[var(--ink-secondary)] transition hover:border-[var(--ink-muted)] hover:text-[var(--ink)]"
            >
              {structure.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function RelatedExpressionsSection({
  expressions,
}: {
  expressions: NonNullable<ComposeAnalysis["relatedExpressions"]>;
}) {
  return (
    <AnalysisSection title="Related expressions">
      <ul className="max-w-[700px] space-y-3">
        {expressions.map((expression) => (
          <li key={expression.href}>
            <Link
              href={expression.href}
              className="focus-kb group block rounded-sm border border-[var(--hairline)] px-4 py-4 transition hover:border-[var(--hairline-strong)]"
            >
              <p className="break-russian font-reader text-base text-[var(--ink)] group-hover:text-[var(--color-link)]">
                {expression.label}
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-[var(--ink-secondary)]">
                {expression.reason ?? "Related pattern worth exploring in context."}
              </p>
              <p className="mt-2 text-sm text-[var(--ink-muted)] group-hover:text-[var(--color-link)]">
                Open →
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </AnalysisSection>
  );
}

function RewriteSection({
  onRewrite,
  rewriting,
  openRewriteId,
  rewriteResult,
  rewriteSaved,
  primaryStructureHref,
  onSaveRewrite,
  onPracticeAgain,
}: {
  onRewrite: PracticeAnalysisViewProps["onRewrite"];
  rewriting: string | null;
  openRewriteId: string | null;
  rewriteResult: RewriteResult | null;
  rewriteSaved: boolean;
  primaryStructureHref?: string;
  onSaveRewrite: (text: string) => void;
  onPracticeAgain: (text: string) => void;
}) {
  return (
    <AnalysisSection title="Rewrite">
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {PRACTICE_REWRITE_PRESETS.map((preset) => {
          const meta = REWRITE_CARD_META[preset.id] ?? {
            icon: "✦",
            title: preset.shortTitle,
            description: preset.instruction,
          };
          const isOpen = openRewriteId === preset.id;
          const isLoading = rewriting === preset.id;

          return (
            <li key={preset.id}>
              <button
                type="button"
                disabled={rewriting !== null && !isLoading}
                onClick={() => void onRewrite(preset.id, preset.instruction, preset.shortTitle)}
                className={`focus-kb flex h-full w-full flex-col rounded-sm border px-4 py-4 text-left transition disabled:opacity-40 ${
                  isOpen
                    ? "border-[var(--ink)] bg-[var(--paper)]"
                    : "border-[var(--hairline)] hover:border-[var(--hairline-strong)]"
                }`}
              >
                <span className="text-lg leading-none">{meta.icon}</span>
                <span className="mt-3 font-reader text-base text-[var(--ink)]">{meta.title}</span>
                <span className="mt-1.5 flex-1 text-sm leading-relaxed text-[var(--ink-secondary)]">
                  {meta.description}
                </span>
                <span className="mt-4 text-sm font-medium text-[var(--ink-secondary)]">
                  {isLoading ? "Rewriting…" : "Rewrite →"}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {openRewriteId && rewriteResult?.id === openRewriteId ? (
        <RewriteResultPanel
          shortTitle={rewriteResult.shortTitle}
          text={rewriteResult.text}
          explanation={rewriteResult.explanation}
          structureHref={primaryStructureHref}
          saved={rewriteSaved}
          onCopy={() => void navigator.clipboard.writeText(rewriteResult.text)}
          onSave={() => onSaveRewrite(rewriteResult.text)}
          onPracticeAgain={() => onPracticeAgain(rewriteResult.text)}
        />
      ) : null}
    </AnalysisSection>
  );
}

function RewriteResultPanel({
  shortTitle,
  text,
  explanation,
  structureHref,
  saved,
  onCopy,
  onSave,
  onPracticeAgain,
}: {
  shortTitle: string;
  text: string;
  explanation: string;
  structureHref?: string;
  saved: boolean;
  onCopy: () => void;
  onSave: () => void;
  onPracticeAgain: () => void;
}) {
  return (
    <div className="mt-3 rounded-sm border border-[var(--hairline)] bg-[var(--surface-muted,#fafafa)] px-4 py-4">
      <p className="break-russian font-reader text-base font-medium text-[var(--ink)]">
        ✓ {shortTitle}
      </p>
      <p className="break-russian mt-3 font-reader text-[clamp(1rem,2vw,1.125rem)] leading-relaxed text-[var(--ink)]">
        {text}
      </p>
      <p className="mt-4 text-sm leading-relaxed text-[var(--ink-secondary)]">{explanation}</p>
      <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
        <li>
          <button
            type="button"
            onClick={onCopy}
            className="focus-kb text-[var(--ink-secondary)] hover:text-[var(--ink)]"
          >
            Copy
          </button>
        </li>
        <li>
          <button
            type="button"
            onClick={onSave}
            disabled={saved}
            className="focus-kb text-[var(--ink-secondary)] transition hover:text-[var(--ink)] disabled:cursor-default disabled:text-[var(--ink-muted)]"
          >
            {saved ? "✓ Saved" : "Save to Library"}
          </button>
        </li>
        <li>
          <Reference href={structureHref ?? `/explorer?q=${encodeURIComponent(text)}`}>
            Explore structure
          </Reference>
        </li>
        <li>
          <button
            type="button"
            onClick={onPracticeAgain}
            className="focus-kb text-[var(--ink-secondary)] hover:text-[var(--ink)]"
          >
            Practice again
          </button>
        </li>
      </ul>
    </div>
  );
}

function ContinueLearningSection({
  structureHref,
  saved,
  onSave,
  onPracticeAnother,
}: {
  structureHref: string;
  saved: boolean;
  onSave: () => void;
  onPracticeAnother: () => void;
}) {
  const actions = [
    {
      title: "Explore this structure",
      description: "See how this pattern connects across your library.",
      cta: "Open Explorer →",
      href: structureHref,
      kind: "link" as const,
    },
    {
      title: "Practice another sentence",
      description: "Apply what you learned in a fresh sentence.",
      cta: "Continue →",
      onClick: onPracticeAnother,
      kind: "button" as const,
    },
    {
      title: "Open related lesson",
      description: "Go deeper with a structured manual lesson.",
      cta: "Manual →",
      href: "/manual",
      kind: "link" as const,
    },
    {
      title: "Save to My phrases",
      description: saved ? "Already saved in your library." : "Keep this sentence for later review.",
      cta: saved ? "Saved ✓" : "Library →",
      onClick: onSave,
      kind: "button" as const,
    },
  ];

  return (
    <AnalysisSection title="Continue learning">
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {actions.map((action) => (
          <li key={action.title}>
            {action.kind === "link" ? (
              <Link
                href={action.href!}
                className="focus-kb group flex h-full flex-col rounded-sm border border-[var(--hairline)] px-4 py-4 transition hover:border-[var(--hairline-strong)]"
              >
                <ActionCardContent {...action} />
              </Link>
            ) : (
              <button
                type="button"
                onClick={action.onClick}
                className="focus-kb group flex h-full w-full flex-col rounded-sm border border-[var(--hairline)] px-4 py-4 text-left transition hover:border-[var(--hairline-strong)]"
              >
                <ActionCardContent {...action} />
              </button>
            )}
          </li>
        ))}
      </ul>
    </AnalysisSection>
  );
}

function ActionCardContent({
  title,
  description,
  cta,
}: {
  title: string;
  description: string;
  cta: string;
}) {
  return (
    <>
      <p className="font-reader text-base text-[var(--ink)] group-hover:text-[var(--color-link)]">
        {title}
      </p>
      <p className="mt-1.5 flex-1 text-sm leading-relaxed text-[var(--ink-secondary)]">
        {description}
      </p>
      <p className="mt-4 text-sm font-medium text-[var(--ink-muted)] group-hover:text-[var(--color-link)]">
        {cta}
      </p>
    </>
  );
}

function AnalysisSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <p className="home-section-label">{title}</p>
      <div className="mt-4">{children}</div>
    </section>
  );
}
