"use client";

import { useCallback, useEffect, useState, type ChangeEvent } from "react";
import { useSearchParams } from "next/navigation";

import {
  GhostButton,
  InputField,
  PracticeInput,
  PracticeMarginNote,
  PrimaryButton,
  SectionHeader,
  Tag,
} from "@/components/design-system";
import { Reference, TextEditorialContext } from "@/components/editorial";
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

const THEME_LABELS: Record<ComposeTheme, string> = {
  daily_life: "Vie quotidienne",
  work: "Travail",
  travel: "Voyage",
  literature: "Littérature",
  conversation: "Conversation",
  free: "Libre",
};

const REGISTER_LABELS: Record<ComposeRegister, string> = {
  casual: "Familier",
  neutral: "Neutre",
  formal: "Formel",
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
      toast("Enregistré dans la bibliothèque", "success");
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
      className="pb-8"
      onSubmit={(event) => {
        event.preventDefault();
        void analyze();
      }}
    >
      <header className="editorial-page-section pb-0">
        <SectionHeader title="Pratiquer" />
      </header>

      {structureMode && structureContext ? (
        <section className="editorial-page-section pb-0">
          <StructureContextNote
            context={structureContext}
            referenceSentence={referenceSentence}
          />
        </section>
      ) : null}

      {structureMode && !structureContext && searchParams.get("structure") ? (
        <section className="editorial-page-section pb-0">
          <StructureContextNote
            context={{
              label: searchParams.get("structure") ?? "",
              meaning: null,
              explanation: null,
              exampleSentence: referenceSentence,
              readerHref: searchParams.get("textId")
                ? `/texts/${searchParams.get("textId")}`
                : null,
              readerTitle: searchParams.get("textTitle"),
              readerCollectionId: null,
              readerCollectionName: null,
              explorerHref: `/explorer?q=${encodeURIComponent(searchParams.get("structure") ?? "")}`,
            }}
            referenceSentence={referenceSentence}
          />
        </section>
      ) : null}

      {!structureMode ? (
        <section className="editorial-page-section pb-0">
          <InputField
            id="practice-context"
            label="Votre idée"
            type="text"
            value={context}
            onChange={(event: ChangeEvent<HTMLInputElement>) => setContext(event.target.value)}
            placeholder="En français ou en russe"
          />
        </section>
      ) : null}

      <section className="editorial-page-section pb-0">
        <PracticeInput
          id="practice-russian"
          label={structureMode ? "Votre phrase" : "Votre phrase en russe"}
          value={russianText}
          onChange={(event) => setRussianText(event.target.value)}
          rows={5}
          required
          placeholder="Ваше предложение…"
        />
        <div className="mt-4">
          <PrimaryButton type="submit" disabled={loading || !russianText.trim()}>
            {loading ? "Analyse…" : "Pratiquer →"}
          </PrimaryButton>
        </div>
      </section>

      {showSuggestions ? (
        <section className="editorial-page-section pb-0">
          <p className="text-metadata mb-3">Suggestions</p>
          <ul className="flex flex-wrap gap-2">
            {PRACTICE_SUGGESTIONS.map((suggestion) => (
              <li key={suggestion.label}>
                <Tag onClick={() => setContext(suggestion.context)}>{suggestion.label}</Tag>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {advancedOpen ? (
        <section className="editorial-page-section pb-0">
          <PracticeMarginNote>
            <div className="grid gap-6 sm:grid-cols-2">
              <fieldset>
                <legend className="text-eyebrow mb-2">Thème</legend>
                <ul className="space-y-1.5">
                  {COMPOSE_THEMES.map((item) => (
                    <li key={item.id}>
                      <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--ink-muted)]">
                        <input
                          type="radio"
                          name="theme"
                          value={item.id}
                          checked={theme === item.id}
                          onChange={() => setTheme(item.id)}
                        />
                        {THEME_LABELS[item.id]}
                      </label>
                    </li>
                  ))}
                </ul>
              </fieldset>

              <fieldset>
                <legend className="text-eyebrow mb-2">Registre</legend>
                <ul className="space-y-1.5">
                  {COMPOSE_REGISTERS.map((item) => (
                    <li key={item.id}>
                      <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--ink-muted)]">
                        <input
                          type="radio"
                          name="register"
                          value={item.id}
                          checked={register === item.id}
                          onChange={() => setRegister(item.id)}
                        />
                        {REGISTER_LABELS[item.id]}
                      </label>
                    </li>
                  ))}
                </ul>
              </fieldset>
            </div>
          </PracticeMarginNote>
        </section>
      ) : null}

      <footer className="editorial-page-section flex flex-wrap items-center gap-x-5 gap-y-2">
        <GhostButton onClick={() => setAdvancedOpen((open) => !open)}>
          {advancedOpen ? "Masquer les options" : "Options →"}
        </GhostButton>
        <GhostButton href="/practice/context-translation">Traduction contextualisée →</GhostButton>
      </footer>
    </form>
  );
}

type StructureContextNoteProps = {
  context: StructureContext;
  referenceSentence: string | null;
};

function StructureContextNote({ context, referenceSentence }: StructureContextNoteProps) {
  const example = context.exampleSentence ?? referenceSentence;

  return (
    <PracticeMarginNote>
      <p className="text-eyebrow mb-2">Structure à utiliser</p>
      <p className="break-russian font-reader text-xl text-[var(--ink)]">{context.label}</p>

      {context.meaning ? (
        <p className="mt-3 text-sm leading-relaxed">{context.meaning}</p>
      ) : null}

      {context.explanation ? (
        <p className="mt-2 text-sm leading-relaxed">{context.explanation}</p>
      ) : null}

      {example ? (
        <p className="mt-3 break-russian font-reader text-base text-[var(--ink)]">{example}</p>
      ) : null}

      {context.readerHref && context.readerTitle && context.readerCollectionId ? (
        <div className="mt-4">
          <TextEditorialContext
            eyebrow="Basé sur :"
            title={context.readerTitle}
            collectionId={context.readerCollectionId}
            href={context.readerHref}
            size="sm"
          />
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-4">
        {context.readerHref ? (
          <Reference href={context.readerHref}>Lire →</Reference>
        ) : null}
        <Reference href={context.explorerHref}>Explorer →</Reference>
      </div>
    </PracticeMarginNote>
  );
}