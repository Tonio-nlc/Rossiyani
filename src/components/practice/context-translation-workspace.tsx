"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import {
  GhostButton,
  PracticeInput,
  PrimaryButton,
  SectionHeader,
  Tag,
} from "@/components/design-system";
import { useToast } from "@/components/ui/toast-provider";
import type {
  ContextTranslationAnalysis,
  ContextTranslationFollowUpMessage,
  ContextTranslationProgressPhase,
  ContextTranslationStreamEvent,
} from "@/lib/context-translation/types";
import {
  getContextTranslationLessonById,
  saveContextTranslationLesson,
} from "@/lib/context-translation/saved-lessons";

import { ContextTranslationResult } from "./context-translation-result";

const EXAMPLE_INPUTS = [
  "On est foutu.",
  "I'm exhausted.",
  "Мы сломаны.",
  "Ça vaut le coup.",
  "Take it easy.",
];

const PROGRESS_STEPS: Array<{ phase: ContextTranslationProgressPhase; label: string }> = [
  { phase: "bestTranslation", label: "Meilleure traduction" },
  { phase: "thinkLikeNative", label: "Penser comme un natif" },
  { phase: "grammar", label: "Analyse grammaticale" },
  { phase: "alternatives", label: "Alternatives" },
  { phase: "culturalNotes", label: "Notes culturelles" },
];

function createPartialAnalysis(
  sourceText: string,
  core: Extract<ContextTranslationStreamEvent, { type: "core" }>,
): ContextTranslationAnalysis {
  return {
    sourceLanguage: core.data.sourceLanguage,
    sourceText,
    bestTranslation: core.data.bestTranslation,
    literalMeaning: core.data.literalMeaning,
    thinkLikeNative: core.data.thinkLikeNative,
    naturalness: core.data.naturalness,
    corrections: [],
    alternatives: [],
    culturalNotes: [],
    grammarConcepts: [],
    vocabulary: [],
    saveableLesson: {
      originalSentence: sourceText,
      bestTranslation: core.data.bestTranslation,
      literalMeaning: core.data.literalMeaning,
      thinkLikeNative: core.data.thinkLikeNative,
      naturalness: core.data.naturalness,
      corrections: [],
      alternatives: [],
      grammarConcepts: [],
      culturalNotes: [],
      vocabulary: [],
    },
  };
}

function AnalyzingDots() {
  return (
    <span className="inline-flex gap-0.5" aria-hidden>
      {Array.from({ length: 5 }, (_, index) => (
        <span key={index} className="analyzing-dot inline-block h-1 w-1 rounded-full bg-current" />
      ))}
    </span>
  );
}

type ContextTranslationWorkspaceProps = {
  initialLessonId?: string | null;
};

export function ContextTranslationWorkspace({
  initialLessonId: initialLessonIdProp = null,
}: ContextTranslationWorkspaceProps) {
  const searchParams = useSearchParams();
  const initialLessonId = initialLessonIdProp ?? searchParams.get("lesson");
  const { toast } = useToast();
  const [sourceText, setSourceText] = useState("");
  const [analysis, setAnalysis] = useState<ContextTranslationAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [enrichmentLoading, setEnrichmentLoading] = useState(false);
  const [progressPhase, setProgressPhase] = useState<ContextTranslationProgressPhase | null>(
    null,
  );
  const [savedLesson, setSavedLesson] = useState(false);
  const [visibleSections, setVisibleSections] = useState(0);
  const [followUpMessages, setFollowUpMessages] = useState<ContextTranslationFollowUpMessage[]>(
    [],
  );
  const [followUpLoading, setFollowUpLoading] = useState(false);

  useEffect(() => {
    if (!initialLessonId) {
      return;
    }
    const lesson = getContextTranslationLessonById(initialLessonId);
    if (lesson) {
      setSourceText(lesson.originalSentence);
      setAnalysis(lesson.analysis);
      setSavedLesson(true);
      setVisibleSections(12);
    }
  }, [initialLessonId]);

  useEffect(() => {
    if (!loading) {
      return;
    }

    let index = 0;
    const timer = window.setInterval(() => {
      const step = PROGRESS_STEPS[index];
      if (step) {
        setProgressPhase(step.phase);
        index += 1;
      }
    }, 550);

    return () => window.clearInterval(timer);
  }, [loading]);

  useEffect(() => {
    if (!analysis?.sourceText || loading) {
      return;
    }

    setProgressPhase("complete");
    const maxSections = 12;
    setVisibleSections(0);
    const timers: number[] = [];
    for (let index = 1; index <= maxSections; index += 1) {
      timers.push(
        window.setTimeout(() => {
          setVisibleSections(index);
        }, index * 180),
      );
    }
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [analysis?.sourceText, loading]);

  const submit = useCallback(async () => {
    const trimmed = sourceText.trim();
    if (!trimmed || loading) {
      return;
    }

    setLoading(true);
    setEnrichmentLoading(true);
    setAnalysis(null);
    setSavedLesson(false);
    setFollowUpMessages([]);
    setProgressPhase("bestTranslation");
    setVisibleSections(0);

    try {
      const response = await fetch("/api/practice/context-translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceText: trimmed }),
      });

      if (!response.ok || !response.body) {
        toast("L'analyse a échoué. Réessayez.", "error");
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.trim()) {
            continue;
          }

          const event = JSON.parse(line) as ContextTranslationStreamEvent;

          if (event.type === "phase") {
            setProgressPhase(event.phase);
          }

          if (event.type === "core") {
            setAnalysis(createPartialAnalysis(trimmed, event));
            setLoading(false);
          }

          if (event.type === "enrichment") {
            setAnalysis((current) =>
              current
                ? {
                    ...current,
                    corrections: event.data.corrections,
                    alternatives: event.data.alternatives,
                    culturalNotes: event.data.culturalNotes,
                    grammarConcepts: event.data.grammarConcepts,
                    vocabulary: event.data.vocabulary,
                    saveableLesson: {
                      ...current.saveableLesson,
                      corrections: event.data.corrections,
                      alternatives: event.data.alternatives,
                      grammarConcepts: event.data.grammarConcepts,
                      culturalNotes: event.data.culturalNotes,
                      vocabulary: event.data.vocabulary,
                    },
                  }
                : current,
            );
          }

          if (event.type === "complete") {
            setAnalysis(event.analysis);
            setEnrichmentLoading(false);
          }

          if (event.type === "error") {
            toast(event.message, "error");
          }
        }
      }
    } catch {
      toast("L'analyse a échoué. Réessayez.", "error");
    } finally {
      setLoading(false);
      setEnrichmentLoading(false);
    }
  }, [sourceText, loading, toast]);

  const handleSaveLesson = useCallback(() => {
    if (!analysis) {
      return;
    }
    saveContextTranslationLesson(analysis);
    setSavedLesson(true);
  }, [analysis]);

  const handleStartOver = useCallback(() => {
    setAnalysis(null);
    setSourceText("");
    setSavedLesson(false);
    setFollowUpMessages([]);
    setProgressPhase(null);
    setVisibleSections(0);
    setEnrichmentLoading(false);
  }, []);

  const handleFollowUp = useCallback(
    async (question: string) => {
      if (!analysis) {
        return;
      }

      setFollowUpLoading(true);
      const userMessage: ContextTranslationFollowUpMessage = {
        role: "user",
        content: question,
      };
      setFollowUpMessages((messages) => [...messages, userMessage]);

      try {
        const response = await fetch("/api/practice/context-translate/follow-up", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            analysis,
            history: followUpMessages,
            question,
          }),
        });

        if (!response.ok) {
          toast("Impossible de répondre à la question.", "error");
          return;
        }

        const payload = (await response.json()) as { answer: string };
        setFollowUpMessages((messages) => [
          ...messages,
          { role: "assistant", content: payload.answer },
        ]);
      } finally {
        setFollowUpLoading(false);
      }
    },
    [analysis, followUpMessages, toast],
  );

  if (analysis && !loading) {
    return (
      <ContextTranslationResult
        analysis={analysis}
        visibleSections={visibleSections}
        enrichmentLoading={enrichmentLoading}
        savedLesson={savedLesson}
        followUpMessages={followUpMessages}
        followUpLoading={followUpLoading}
        onSaveLesson={handleSaveLesson}
        onStartOver={handleStartOver}
        onFollowUp={handleFollowUp}
      />
    );
  }

  return (
    <form
      className="pb-8"
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
    >
      <header className="editorial-page-section pb-0">
        <GhostButton href="/practice">← Pratique</GhostButton>
        <div className="mt-4">
          <SectionHeader title="Traduction contextualisée" />
        </div>
      </header>

      <section className="editorial-page-section">
        <PracticeInput
          compact
          value={sourceText}
          onChange={(event) => setSourceText(event.target.value)}
          rows={4}
          placeholder={"Traduire une idée, pas des mots…\n\nExemple :\nOn est foutu."}
        />
      </section>

      {loading && progressPhase ? (
        <section className="editorial-page-section pb-0">
          <ul className="space-y-1.5 border-t border-[var(--hairline)] pt-4">
            {PROGRESS_STEPS.map((step) => {
              const stepIndex = PROGRESS_STEPS.findIndex((item) => item.phase === step.phase);
              const currentIndex = PROGRESS_STEPS.findIndex((item) => item.phase === progressPhase);
              const isDone = currentIndex > stepIndex || progressPhase === "complete";
              const isCurrent = step.phase === progressPhase;
              return (
                <li
                  key={step.phase}
                  className={[
                    "text-sm",
                    isDone
                      ? "text-[var(--ink-muted)]"
                      : isCurrent
                        ? "text-[var(--ink)]"
                        : "text-[var(--ink-muted)]/45",
                  ].join(" ")}
                >
                  {step.label}
                  {isCurrent ? "…" : ""}
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      <section className="editorial-page-section pb-0">
        <p className="text-eyebrow mb-3">Exemples</p>
        <ul className="flex flex-wrap gap-2">
          {EXAMPLE_INPUTS.map((example) => (
            <li key={example}>
              <Tag onClick={() => setSourceText(example)}>{example}</Tag>
            </li>
          ))}
        </ul>
      </section>

      <footer className="editorial-page-section flex justify-end border-t border-[var(--hairline)] pt-6">
        <PrimaryButton type="submit" disabled={!sourceText.trim() || loading}>
          {loading ? (
            <>
              Analyse… <AnalyzingDots />
            </>
          ) : (
            "Traduire et expliquer →"
          )}
        </PrimaryButton>
      </footer>
    </form>
  );
}
