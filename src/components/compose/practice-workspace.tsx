"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { Reference, Section } from "@/components/editorial";
import { useToast } from "@/components/ui/toast-provider";
import type { StructureContext } from "@/features/practice/get-structure-context";
import { isPhraseSaved, rewriteTypeFromPresetId, savePhrase } from "@/features/library";
import type {
  ComposeAnalysis,
  ComposeRegister,
  ComposeTheme,
} from "@/lib/compose/types";
import { COMPOSE_REGISTERS, COMPOSE_THEMES } from "@/lib/compose/types";
import { saveComposePhrase, getComposePhraseById } from "@/lib/compose/saved-phrases";
import { PRACTICE_SUGGESTIONS } from "@/lib/practice/constants";

import { PracticeAnalysisView } from "./practice-analysis-view";

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
  const { toast } = useToast();
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
  const [rewriteSavedLocally, setRewriteSavedLocally] = useState(false);

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
          setRewriteSavedLocally(false);
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
      if (!analysis || !openRewriteId) {
        return;
      }

      savePhrase({
        originalSentence: russianText.trim(),
        rewrittenSentence: rewritten,
        rewriteType: rewriteTypeFromPresetId(openRewriteId),
        explanation: rewriteResult?.explanation ?? "",
        structures: analysis.structures.map((structure) => ({
          label: structure.label,
          href: structure.href,
        })),
        source: "practice",
      });
      setRewriteSavedLocally(true);
      toast("✓ Saved to Library", "success");
    },
    [analysis, openRewriteId, rewriteResult?.explanation, russianText, toast],
  );

  const handlePracticeAgain = useCallback((text: string) => {
    setRussianText(text);
    setAnalysis(null);
    setRewriteResult(null);
    setOpenRewriteId(null);
    setSaved(false);
    setRewriteSavedLocally(false);
  }, []);

  const rewriteSaved =
    rewriteResult !== null &&
    (rewriteSavedLocally || isPhraseSaved(russianText.trim(), rewriteResult.text));

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
        rewriteSaved={rewriteSaved}
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

/** @deprecated Use PracticeWorkspace */
export const ComposeWorkspace = PracticeWorkspace;
