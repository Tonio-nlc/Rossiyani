"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";

import { Reference, Section } from "@/components/editorial";
import type { StructureContext } from "@/features/practice/get-structure-context";
import type {
  ComposeAnalysis,
  ComposeRegister,
  ComposeTheme,
} from "@/lib/compose/types";
import {
  COMPOSE_REGISTERS,
  COMPOSE_THEMES,
  COMPOSE_VERDICT_LABELS,
  PRACTICE_REWRITE_PRESETS,
} from "@/lib/compose/types";
import { saveComposePhrase, getComposePhraseById } from "@/lib/compose/saved-phrases";
import { PRACTICE_SUGGESTIONS } from "@/lib/practice/constants";

type RewriteResult = {
  id: string;
  shortTitle: string;
  text: string;
  explanation: string;
};

function isStructureMode(searchParams: URLSearchParams): boolean {
  if (!searchParams.has("structure")) {
    return false;
  }
  const from = searchParams.get("from");
  if (from === "explorer" || from === "reader" || searchParams.get("mode") === "structure") {
    return true;
  }
  return !searchParams.has("text") && !searchParams.has("phraseId");
}

export function PracticeWorkspace() {
  const searchParams = useSearchParams();
  const [context, setContext] = useState("");
  const [russianText, setRussianText] = useState("");
  const [referenceSentence, setReferenceSentence] = useState<string | null>(null);
  const [structureContext, setStructureContext] = useState<StructureContext | null>(null);
  const [structureMode, setStructureMode] = useState(false);
  const [theme, setTheme] = useState<ComposeTheme>("free");
  const [register, setRegister] = useState<ComposeRegister>("neutral");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rewriting, setRewriting] = useState<string | null>(null);
  const [openRewriteId, setOpenRewriteId] = useState<string | null>(null);
  const [rewriteResult, setRewriteResult] = useState<RewriteResult | null>(null);
  const [analysis, setAnalysis] = useState<ComposeAnalysis | null>(null);
  const [expandedBlocks, setExpandedBlocks] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const phraseId = searchParams.get("phraseId");
    if (phraseId) {
      const savedPhrase = getComposePhraseById(phraseId);
      if (savedPhrase) {
        setContext(savedPhrase.context ?? "");
        setRussianText(savedPhrase.originalSentence);
        setAnalysis(savedPhrase.analysis);
        setSaved(true);
        setStructureMode(false);
        setStructureContext(null);
        return;
      }
    }

    const structure = searchParams.get("structure");
    const ctx = searchParams.get("context");
    const text = searchParams.get("text");
    const reference = searchParams.get("reference");
    const fromExplorer = isStructureMode(searchParams);

    setReferenceSentence(reference);
    setStructureMode(Boolean(structure && fromExplorer));

    if (structure && fromExplorer) {
      void fetch(`/api/practice/structure?label=${encodeURIComponent(structure)}`)
        .then((response) => (response.ok ? response.json() : null))
        .then((payload: { context: StructureContext } | null) => {
          setStructureContext(payload?.context ?? null);
        })
        .catch(() => setStructureContext(null));
    } else {
      setStructureContext(null);
    }

    if (text) {
      setRussianText(text);
    } else if (structure && !fromExplorer) {
      setRussianText(structure);
    } else {
      setRussianText("");
    }

    if (ctx) {
      setContext(ctx);
    }
  }, [searchParams]);

  const analyze = useCallback(async () => {
    if (!russianText.trim()) {
      return;
    }

    setLoading(true);
    setSaved(false);
    setRewriteResult(null);
    setOpenRewriteId(null);
    try {
      const response = await fetch("/api/practice/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context: context.trim() || undefined,
          russianText: russianText.trim(),
          theme,
          register,
        }),
      });

      if (!response.ok) {
        return;
      }

      const payload = (await response.json()) as { analysis: ComposeAnalysis };
      setAnalysis(payload.analysis);
      setExpandedBlocks({});
    } finally {
      setLoading(false);
    }
  }, [context, register, russianText, theme]);

  const rewrite = useCallback(
    async (presetId: string, instruction: string, shortTitle: string) => {
      if (openRewriteId === presetId && rewriteResult?.id === presetId) {
        setOpenRewriteId(null);
        return;
      }

      setOpenRewriteId(presetId);
      setRewriteResult(null);
      setRewriting(presetId);
      try {
        const response = await fetch("/api/practice/rewrite", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            russianText,
            instruction,
            context: context.trim() || undefined,
          }),
        });

        if (response.ok) {
          const payload = (await response.json()) as { rewritten: string; explanation: string };
          setRewriteResult({
            id: presetId,
            shortTitle,
            text: payload.rewritten,
            explanation: payload.explanation,
          });
        }
      } finally {
        setRewriting(null);
      }
    },
    [context, openRewriteId, rewriteResult?.id, russianText],
  );

  const handlePracticeAnother = useCallback(() => {
    setAnalysis(null);
    setRewriteResult(null);
    setOpenRewriteId(null);
    setRussianText("");
    setSaved(false);
  }, []);

  const handleSave = useCallback(() => {
    if (!analysis) {
      return;
    }

    saveComposePhrase({
      originalSentence: russianText.trim(),
      context: context.trim() || undefined,
      correctedVersion: analysis.alternatives[0]?.text,
      alternatives: analysis.alternatives,
      structures: analysis.structures,
      analysis,
    });
    setSaved(true);
  }, [analysis, context, russianText]);

  const handleSaveRewrite = useCallback(
    (rewritten: string) => {
      if (!analysis) {
        return;
      }

      saveComposePhrase({
        originalSentence: russianText.trim(),
        context: context.trim() || undefined,
        correctedVersion: rewritten,
        alternatives: analysis.alternatives,
        structures: analysis.structures,
        analysis,
      });
      setSaved(true);
    },
    [analysis, context, russianText],
  );

  const handlePracticeAgain = useCallback((text: string) => {
    setRussianText(text);
    setAnalysis(null);
    setRewriteResult(null);
    setOpenRewriteId(null);
    setSaved(false);
  }, []);

  if (analysis) {
    return (
      <PracticeAnalysisView
        analysis={analysis}
        expandedBlocks={expandedBlocks}
        onToggleBlock={(id) =>
          setExpandedBlocks((current) => ({ ...current, [id]: !current[id] }))
        }
        onRewrite={rewrite}
        rewriting={rewriting}
        openRewriteId={openRewriteId}
        rewriteResult={rewriteResult}
        saved={saved}
        onSave={handleSave}
        onSaveRewrite={handleSaveRewrite}
        onPracticeAgain={handlePracticeAgain}
        onPracticeAnother={handlePracticeAnother}
      />
    );
  }

  const showSuggestions = !russianText.trim() && !structureMode;

  return (
    <form
      className="space-y-8"
      onSubmit={(event) => {
        event.preventDefault();
        void analyze();
      }}
    >
      <Section eyebrow="Practice" title="Express an idea in Russian.">
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-[var(--ink-secondary)]">
          Practice is where you transform thoughts into natural Russian.
        </p>
      </Section>

      {structureMode && structureContext ? (
        <StructureHeader context={structureContext} referenceSentence={referenceSentence} />
      ) : null}

      {structureMode && !structureContext && searchParams.get("structure") ? (
        <StructureHeader
          context={{
            label: searchParams.get("structure") ?? "",
            meaning: null,
            explanation: null,
            exampleSentence: referenceSentence,
            readerHref: searchParams.get("textId")
              ? `/texts/${searchParams.get("textId")}`
              : null,
            readerTitle: searchParams.get("textTitle"),
            explorerHref: `/explorer?q=${encodeURIComponent(searchParams.get("structure") ?? "")}`,
          }}
          referenceSentence={referenceSentence}
        />
      ) : null}

      {!structureMode ? (
        <div>
          <label htmlFor="practice-context" className="home-section-label">
            What do you want to say?
          </label>
          <input
            id="practice-context"
            type="text"
            value={context}
            onChange={(event) => setContext(event.target.value)}
            placeholder="Optional — your idea in any language"
            className="focus-kb mt-3 w-full border-b border-[var(--hairline)] bg-transparent py-2 font-reader text-base text-[var(--ink)] outline-none placeholder:text-[var(--ink-muted)]"
          />
        </div>
      ) : null}

      {showSuggestions ? (
        <div>
          <p className="home-section-label">Need inspiration?</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {PRACTICE_SUGGESTIONS.map((suggestion) => (
              <li key={suggestion.label}>
                <button
                  type="button"
                  onClick={() => setContext(suggestion.context)}
                  className="focus-kb border border-[var(--hairline)] px-3 py-1.5 text-sm text-[var(--ink-secondary)] transition hover:border-[var(--ink-muted)] hover:text-[var(--ink)]"
                >
                  {suggestion.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div>
        <label htmlFor="practice-russian" className="home-section-label">
          {structureMode ? "Now express your own idea" : "Write naturally in Russian"}
        </label>
        <textarea
          id="practice-russian"
          value={russianText}
          onChange={(event) => setRussianText(event.target.value)}
          rows={4}
          required
          className="focus-kb break-russian mt-3 w-full min-w-0 resize-y border border-[var(--hairline)] bg-transparent px-3 py-3 font-reader text-[clamp(1rem,2.5vw,1.125rem)] leading-relaxed text-[var(--ink)] outline-none placeholder:text-[var(--ink-muted)]"
          placeholder="Ваше предложение…"
        />
      </div>

      <details
        className="group"
        open={advancedOpen}
        onToggle={(event) => setAdvancedOpen(event.currentTarget.open)}
      >
        <summary className="focus-kb cursor-pointer text-sm font-medium text-[var(--ink-secondary)]">
          Advanced
        </summary>

        <div className="mt-4 grid gap-6 sm:grid-cols-2">
          <fieldset>
            <legend className="home-section-label">Theme</legend>
            <ul className="mt-2 space-y-1">
              {COMPOSE_THEMES.map((item) => (
                <li key={item.id}>
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--ink-secondary)]">
                    <input
                      type="radio"
                      name="theme"
                      value={item.id}
                      checked={theme === item.id}
                      onChange={() => setTheme(item.id)}
                    />
                    {item.label}
                  </label>
                </li>
              ))}
            </ul>
          </fieldset>

          <fieldset>
            <legend className="home-section-label">Register</legend>
            <ul className="mt-2 space-y-1">
              {COMPOSE_REGISTERS.map((item) => (
                <li key={item.id}>
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--ink-secondary)]">
                    <input
                      type="radio"
                      name="register"
                      value={item.id}
                      checked={register === item.id}
                      onChange={() => setRegister(item.id)}
                    />
                    {item.label}
                  </label>
                </li>
              ))}
            </ul>
          </fieldset>
        </div>
      </details>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading || !russianText.trim()}
          className="focus-kb bg-[var(--ink)] px-6 py-3 text-sm font-medium text-[var(--paper)] transition hover:opacity-90 disabled:opacity-40"
        >
          {loading ? "Analyzing…" : "Analyze →"}
        </button>
      </div>
    </form>
  );
}

type StructureHeaderProps = {
  context: StructureContext;
  referenceSentence: string | null;
};

function StructureHeader({ context, referenceSentence }: StructureHeaderProps) {
  const example = context.exampleSentence ?? referenceSentence;

  return (
    <div className="space-y-4 border-b border-[var(--hairline)] pb-6">
      <p className="home-section-label">Using this structure</p>
      <p className="break-russian font-reader text-[clamp(1.5rem,3vw,1.75rem)] text-[var(--ink)]">{context.label}</p>

      {context.meaning ? (
        <div>
          <p className="home-section-label">Meaning</p>
          <p className="mt-1 text-sm text-[var(--ink-secondary)]">{context.meaning}</p>
        </div>
      ) : null}

      {context.explanation ? (
        <div>
          <p className="home-section-label">Explanation</p>
          <p className="mt-1 text-sm leading-relaxed text-[var(--ink-secondary)]">
            {context.explanation}
          </p>
        </div>
      ) : null}

      {example ? (
        <div>
          <p className="home-section-label">Authentic example</p>
          <p className="mt-1 font-reader text-base text-[var(--ink)]">{example}</p>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-4 text-sm">
        {context.readerHref ? (
          <Reference href={context.readerHref}>
            {context.readerTitle ? `Open in Reader — ${context.readerTitle}` : "Open in Reader →"}
          </Reference>
        ) : null}
        <Reference href={context.explorerHref}>Open in Explorer →</Reference>
      </div>
    </div>
  );
}

type PracticeChapterProps = {
  title?: string;
  children: ReactNode;
  first?: boolean;
};

function PracticeChapter({ title, children, first = false }: PracticeChapterProps) {
  return (
    <>
      {!first ? <hr className="border-0 border-t border-[var(--hairline)]" aria-hidden /> : null}
      <section className={first ? "pb-1" : "pt-[var(--space-6)] pb-1"}>
        {title ? <p className="home-section-label">{title}</p> : null}
        <div className={title ? "mt-[var(--space-3)]" : undefined}>{children}</div>
      </section>
    </>
  );
}

type PracticeAnalysisViewProps = {
  analysis: ComposeAnalysis;
  expandedBlocks: Record<string, boolean>;
  onToggleBlock: (id: string) => void;
  onRewrite: (presetId: string, instruction: string, shortTitle: string) => Promise<void>;
  rewriting: string | null;
  openRewriteId: string | null;
  rewriteResult: RewriteResult | null;
  saved: boolean;
  onSave: () => void;
  onSaveRewrite: (text: string) => void;
  onPracticeAgain: (text: string) => void;
  onPracticeAnother: () => void;
};

function PracticeAnalysisView({
  analysis,
  expandedBlocks,
  onToggleBlock,
  onRewrite,
  rewriting,
  openRewriteId,
  rewriteResult,
  saved,
  onSave,
  onSaveRewrite,
  onPracticeAgain,
  onPracticeAnother,
}: PracticeAnalysisViewProps) {
  const primaryStructure = analysis.structures[0];
  const structureHref = primaryStructure?.href ?? "/explorer";

  return (
    <div className="pb-[var(--space-7)]">
      <PracticeChapter first>
        <p className="break-russian font-reader text-[clamp(1.75rem,4vw,1.875rem)] text-[var(--ink)]">
          {COMPOSE_VERDICT_LABELS[analysis.verdict]}
        </p>
        <p className="mt-[var(--space-2)] text-base leading-relaxed text-[var(--ink-secondary)]">
          {analysis.summary}
        </p>
      </PracticeChapter>

      {analysis.alternatives.length > 0 ? (
        <PracticeChapter title="Native alternatives">
          <ul className="space-y-[var(--space-4)]">
            {analysis.alternatives.map((alt) => (
              <li key={`${alt.register}-${alt.text}`} className="border-b border-[var(--hairline)] pb-[var(--space-4)] last:border-0 last:pb-0">
                <p className="text-metadata text-[var(--ink-muted)]">{alt.register}</p>
                <p className="mt-[var(--space-2)] font-reader text-lg leading-relaxed text-[var(--ink)]">{alt.text}</p>
              </li>
            ))}
          </ul>
        </PracticeChapter>
      ) : null}

      <PracticeChapter title="Linguistic analysis">
        <ul className="divide-y divide-[var(--hairline)]">
          {analysis.linguisticBlocks.map((block) => (
            <li key={block.id} className="py-[var(--space-3)] first:pt-0 last:pb-0">
              <p className="text-sm font-medium text-[var(--ink)]">{block.category}</p>
              <p className="mt-[var(--space-1)] text-sm leading-relaxed text-[var(--ink-secondary)]">
                {expandedBlocks[block.id] ? block.note : block.note.slice(0, 120)}
                {!expandedBlocks[block.id] && block.note.length > 120 ? "…" : ""}
              </p>
              {block.note.length > 120 ? (
                <button
                  type="button"
                  onClick={() => onToggleBlock(block.id)}
                  className="focus-kb mt-[var(--space-2)] text-sm text-[var(--ink-secondary)] hover:text-[var(--ink)]"
                >
                  {expandedBlocks[block.id] ? "Collapse" : "Open explanation →"}
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      </PracticeChapter>

      {analysis.structures.length > 0 ? (
        <PracticeChapter title="Detected structures">
          <ul className="flex flex-wrap gap-x-2 gap-y-2.5">
            {analysis.structures.map((structure) => (
              <li key={structure.href}>
                <Link
                  href={structure.href}
                  className="focus-kb inline-block border border-[var(--hairline)] px-2.5 py-1 font-reader text-sm text-[var(--ink-secondary)] transition hover:border-[var(--ink-muted)] hover:text-[var(--ink)]"
                >
                  {structure.label}
                </Link>
              </li>
            ))}
          </ul>
        </PracticeChapter>
      ) : null}

      {analysis.relatedExpressions?.length ? (
        <PracticeChapter title="Related expressions">
          <ul className="divide-y divide-[var(--hairline)]">
            {analysis.relatedExpressions.map((expression) => (
              <li key={expression.href} className="py-[var(--space-4)] first:pt-0 last:pb-0">
                <Link
                  href={expression.href}
                  className="focus-kb font-reader text-base text-[var(--ink)] transition hover:text-[var(--color-link)]"
                >
                  {expression.label}
                </Link>
                <p className="mt-[var(--space-2)] text-sm leading-relaxed text-[var(--ink-secondary)]">
                  {expression.reason ?? "Related pattern worth exploring in context."}
                </p>
              </li>
            ))}
          </ul>
        </PracticeChapter>
      ) : null}

      <PracticeChapter title="Rewrite">
        <ul className="divide-y divide-[var(--hairline)]">
          {PRACTICE_REWRITE_PRESETS.map((preset) => {
            const isOpen = openRewriteId === preset.id;
            const isLoading = rewriting === preset.id;
            const result = rewriteResult?.id === preset.id ? rewriteResult : null;

            return (
              <li key={preset.id}>
                <button
                  type="button"
                  disabled={rewriting !== null && !isLoading}
                  onClick={() => void onRewrite(preset.id, preset.instruction, preset.shortTitle)}
                  className="focus-kb flex w-full items-center justify-between py-[var(--space-3)] text-left text-sm text-[var(--ink-secondary)] transition hover:text-[var(--ink)] disabled:opacity-40"
                >
                  <span>{preset.label}</span>
                  <span className="text-[var(--ink-muted)]">{isLoading ? "…" : isOpen ? "−" : ""}</span>
                </button>

                {isOpen && result ? (
                  <RewriteResultBlock
                    shortTitle={result.shortTitle}
                    text={result.text}
                    explanation={result.explanation}
                    structureHref={primaryStructure?.href}
                    onCopy={() => void navigator.clipboard.writeText(result.text)}
                    onSave={() => onSaveRewrite(result.text)}
                    onPracticeAgain={() => onPracticeAgain(result.text)}
                  />
                ) : null}
              </li>
            );
          })}
        </ul>
      </PracticeChapter>

      <ContinueLearningSection
        structureHref={structureHref}
        saved={saved}
        onSave={onSave}
        onPracticeAnother={onPracticeAnother}
      />
    </div>
  );
}

type ContinueLearningSectionProps = {
  structureHref: string;
  saved: boolean;
  onSave: () => void;
  onPracticeAnother: () => void;
};

function ContinueLearningSection({
  structureHref,
  saved,
  onSave,
  onPracticeAnother,
}: ContinueLearningSectionProps) {
  return (
    <>
      <hr className="border-0 border-t border-[var(--hairline)]" aria-hidden />
      <section className="pt-[var(--space-6)]">
        <p className="home-section-label">Continue learning</p>
        <ul className="mt-[var(--space-4)] space-y-[var(--space-4)]">
          <li>
            <Link
              href={structureHref}
              className="focus-kb block text-base font-medium text-[var(--ink)] transition hover:text-[var(--color-link)]"
            >
              Explore this structure →
            </Link>
          </li>
          <li>
            <button
              type="button"
              onClick={onPracticeAnother}
              className="focus-kb text-base font-medium text-[var(--ink)] transition hover:text-[var(--color-link)]"
            >
              Practice another sentence →
            </button>
          </li>
          <li>
            <Link
              href="/manual"
              className="focus-kb block text-base font-medium text-[var(--ink)] transition hover:text-[var(--color-link)]"
            >
              Open lesson →
            </Link>
          </li>
          <li>
            <button
              type="button"
              onClick={onSave}
              className="focus-kb text-base font-medium text-[var(--ink)] transition hover:text-[var(--color-link)]"
            >
              {saved ? "Saved to My phrases ✓" : "Save to My phrases →"}
            </button>
          </li>
        </ul>
      </section>
    </>
  );
}

type RewriteResultBlockProps = {
  shortTitle: string;
  text: string;
  explanation: string;
  structureHref?: string;
  onCopy: () => void;
  onSave: () => void;
  onPracticeAgain: () => void;
};

function RewriteResultBlock({
  shortTitle,
  text,
  explanation,
  structureHref,
  onCopy,
  onSave,
  onPracticeAgain,
}: RewriteResultBlockProps) {
  return (
    <div className="border-t border-[var(--hairline)] pb-[var(--space-4)] pt-[var(--space-2)]">
      <p className="break-russian font-reader text-[clamp(1.125rem,2.5vw,1.25rem)] text-[var(--ink)]">✓ {shortTitle}</p>
      <p className="break-russian mt-[var(--space-3)] font-reader text-[clamp(1rem,2vw,1.125rem)] leading-relaxed text-[var(--ink)]">{text}</p>

      <div className="mt-[var(--space-4)]">
        <p className="home-section-label">Explanation</p>
        <p className="mt-[var(--space-2)] text-sm leading-relaxed text-[var(--ink-secondary)]">{explanation}</p>
      </div>

      <div className="mt-[var(--space-4)]">
        <p className="home-section-label">Actions</p>
        <ul className="mt-[var(--space-2)] space-y-[var(--space-2)] text-sm">
          <li>
            <button type="button" onClick={onCopy} className="focus-kb text-[var(--ink-secondary)] hover:text-[var(--ink)]">
              Copy
            </button>
          </li>
          <li>
            <button type="button" onClick={onSave} className="focus-kb text-[var(--ink-secondary)] hover:text-[var(--ink)]">
              Save
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
    </div>
  );
}

/** @deprecated Use PracticeWorkspace */
export const ComposeWorkspace = PracticeWorkspace;
