"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

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
  { phase: "bestTranslation", label: "Best translation" },
  { phase: "thinkLikeNative", label: "Think like a native" },
  { phase: "grammar", label: "Analyzing grammar" },
  { phase: "alternatives", label: "Finding alternatives" },
  { phase: "culturalNotes", label: "Adding cultural notes" },
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
        toast("Analysis failed. Try again.", "error");
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
      toast("Analysis failed. Try again.", "error");
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
          toast("Could not answer follow-up.", "error");
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
    <div className="space-y-6">
      <header className="space-y-1.5">
        <Link
          href="/practice"
          className="focus-kb text-xs text-[var(--ink-muted)] underline-offset-2 hover:text-[var(--ink)] hover:underline"
        >
          ← Practice
        </Link>
        <p className="home-section-label">Context Translation</p>
        <h1 className="font-reader text-[clamp(1.5rem,3.5vw,2rem)] leading-tight text-[var(--ink)]">
          Think like a native speaker
        </h1>
        <p className="max-w-xl text-sm leading-relaxed text-[var(--ink-secondary)]">
          Write a sentence in French, English or Russian.
        </p>
      </header>

      <form
        className="mx-auto max-w-2xl space-y-3.5"
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        <textarea
          value={sourceText}
          onChange={(event) => setSourceText(event.target.value)}
          rows={3}
          placeholder={"Translate an idea, not words...\n\nExample:\nOn est foutu."}
          className="focus-kb break-russian min-h-[140px] w-full resize-y rounded-xl border border-[var(--hairline)] bg-[var(--surface)] px-5 py-3.5 font-reader text-[clamp(1rem,2.5vw,1.125rem)] leading-relaxed text-[var(--ink)] outline-none transition-[border-color,box-shadow] duration-200 placeholder:font-reader placeholder:text-[0.9375rem] placeholder:leading-relaxed placeholder:text-[var(--ink-muted)]/70 hover:border-[var(--ink-muted)]/35 focus:border-[var(--ink-muted)] focus:shadow-[0_1px_3px_rgba(0,0,0,0.06),0_0_0_1px_var(--ink-muted)] focus:outline-none"
        />

        <button
          type="submit"
          disabled={!sourceText.trim()}
          className="focus-kb inline-flex w-fit min-h-11 items-center justify-center gap-2 rounded-full bg-[var(--ink)] px-6 py-2.5 font-sans text-sm font-medium text-[var(--surface)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? (
            <>
              Analyzing...
              <AnalyzingDots />
            </>
          ) : (
            "Translate & Explain →"
          )}
        </button>

        <div className="space-y-2.5 pt-1">
          <p className="text-xs text-[var(--ink-muted)]">Popular examples</p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_INPUTS.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => setSourceText(example)}
                className="focus-kb rounded-full border border-[var(--hairline)] bg-[var(--surface)] px-3.5 py-1.5 font-reader text-sm text-[var(--ink-secondary)] transition hover:border-[var(--ink-muted)] hover:bg-[var(--surface-elevated)] hover:text-[var(--ink)]"
              >
                ○ {example}
              </button>
            ))}
          </div>
        </div>
      </form>

      {loading && progressPhase ? (
        <div className="mx-auto max-w-md space-y-1.5 border-t border-[var(--hairline)] pt-4">
          {PROGRESS_STEPS.map((step) => {
            const stepIndex = PROGRESS_STEPS.findIndex((item) => item.phase === step.phase);
            const currentIndex = PROGRESS_STEPS.findIndex((item) => item.phase === progressPhase);
            const isDone = currentIndex > stepIndex || progressPhase === "complete";
            const isCurrent = step.phase === progressPhase;
            return (
              <p
                key={step.phase}
                className={[
                  "text-sm transition-colors duration-200",
                  isDone
                    ? "text-[var(--ink-secondary)]"
                    : isCurrent
                      ? "text-[var(--ink)]"
                      : "text-[var(--ink-muted)]/45",
                ].join(" ")}
              >
                {isDone ? "✓ " : isCurrent ? "↓ " : "  "}
                {step.label}
                {isCurrent ? "…" : ""}
              </p>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
