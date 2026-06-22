"use client";

import { useCallback, useEffect, useState, type ChangeEvent } from "react";
import { useSearchParams } from "next/navigation";

import {
  GhostButton,
  InputField,
  PracticeInput,
  PrimaryButton,
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

import { PracticeAnalysisView } from "./practice-analysis-view";
import { PracticeExerciseHeader } from "../practice/practice-exercise-header";
import { PracticeHub } from "../practice/practice-hub";

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

function hasExerciseEntry(searchParams: URLSearchParams): boolean {
  return (
    searchParams.get("mode") === "sentence" ||
    Boolean(searchParams.get("structure")) ||
    Boolean(searchParams.get("phraseId")) ||
    Boolean(searchParams.get("text"))
  );
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
        originalSentence={russianText.trim()}
        structureContext={structureContext}
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

  if (!hasExerciseEntry(searchParams)) {
    return (
      <div className="practice-shell pb-8">
        <PracticeHub />
      </div>
    );
  }

  const exerciseType = structureMode ? "Structure ciblée" : "Constructeur de phrases";
  const sourceTitle =
    structureContext?.readerTitle ?? searchParams.get("textTitle") ?? null;
  const sourceHref =
    structureContext?.readerHref ??
    (searchParams.get("textId") ? `/texts/${searchParams.get("textId")}` : null);

  return (
    <form
      className="practice-shell pb-8"
      onSubmit={(event) => {
        event.preventDefault();
        void analyze();
      }}
    >
      <PracticeExerciseHeader
        exerciseType={exerciseType}
        title={structureMode ? structureContext?.label ?? searchParams.get("structure") : "Composez en russe"}
        subtitle={
          structureMode
            ? "Utilisez la structure rencontrée dans votre lecture."
            : "Formulez une phrase à partir de ce que vous avez lu et observé."
        }
        sourceTitle={sourceTitle}
        sourceHref={sourceHref}
      />

      <div className="practice-exercise-layout">
        <div className="practice-main-card">
          {structureMode && structureContext ? (
            <StructureContextPanel
              context={structureContext}
              referenceSentence={referenceSentence}
            />
          ) : null}

          {structureMode && !structureContext && searchParams.get("structure") ? (
            <StructureContextPanel
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
          ) : null}

          {!structureMode ? (
            <div className="practice-field">
              <InputField
                id="practice-context"
                label="Votre idée"
                type="text"
                value={context}
                onChange={(event: ChangeEvent<HTMLInputElement>) => setContext(event.target.value)}
                placeholder="En français ou en russe"
              />
            </div>
          ) : null}

          <div className="practice-field">
            <PracticeInput
              id="practice-russian"
              label={structureMode ? "Votre phrase" : "Votre phrase en russe"}
              value={russianText}
              onChange={(event) => setRussianText(event.target.value)}
              rows={5}
              required
              placeholder="Ваше предложение…"
            />
          </div>

          <div className="practice-main-card__actions">
            <PrimaryButton
              type="submit"
              variant="gold"
              disabled={loading || !russianText.trim()}
            >
              {loading ? "Analyse…" : "Valider →"}
            </PrimaryButton>
            <GhostButton onClick={() => setAdvancedOpen((open) => !open)}>
              {advancedOpen ? "Masquer les options" : "Options →"}
            </GhostButton>
          </div>

          {advancedOpen ? (
            <div className="practice-advanced">
              <div className="practice-advanced__grid">
                <fieldset>
                  <legend className="practice-advanced__legend">Thème</legend>
                  <ul className="practice-advanced__options">
                    {COMPOSE_THEMES.map((item) => (
                      <li key={item.id}>
                        <label className="practice-advanced__option">
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
                  <legend className="practice-advanced__legend">Registre</legend>
                  <ul className="practice-advanced__options">
                    {COMPOSE_REGISTERS.map((item) => (
                      <li key={item.id}>
                        <label className="practice-advanced__option">
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
            </div>
          ) : null}
        </div>
      </div>
    </form>
  );
}

type StructureContextPanelProps = {
  context: StructureContext;
  referenceSentence: string | null;
};

function StructureContextPanel({ context, referenceSentence }: StructureContextPanelProps) {
  const example = context.exampleSentence ?? referenceSentence;

  return (
    <div className="practice-context-card">
      <p className="practice-context-card__label">Structure à utiliser</p>
      <p className="practice-context-card__target break-russian font-reader">
        {context.label}
      </p>

      {context.meaning ? (
        <p className="practice-context-card__note">{context.meaning}</p>
      ) : null}

      {context.explanation ? (
        <p className="practice-context-card__note">{context.explanation}</p>
      ) : null}

      {example ? (
        <p className="practice-context-card__example break-russian font-reader">{example}</p>
      ) : null}

      {context.readerHref && context.readerTitle && context.readerCollectionId ? (
        <div className="practice-context-card__source">
          <TextEditorialContext
            eyebrow="Basé sur :"
            title={context.readerTitle}
            collectionId={context.readerCollectionId}
            href={context.readerHref}
            size="sm"
          />
        </div>
      ) : null}

      <div className="practice-context-card__links">
        {context.readerHref ? <Reference href={context.readerHref}>Lire →</Reference> : null}
        <Reference href={context.explorerHref}>Explorer →</Reference>
      </div>
    </div>
  );
}
