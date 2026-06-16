"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { Section } from "@/components/editorial";
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

const EXAMPLE_INPUTS = ["On est foutu.", "We're running late.", "Мы сломаны."];

const PROGRESS_STEPS: Array<{ phase: ContextTranslationProgressPhase; label: string }> = [
  { phase: "bestTranslation", label: "Best translation" },
  { phase: "thinkLikeNative", label: "Think like a native" },
  { phase: "grammar", label: "Analyzing grammar…" },
  { phase: "alternatives", label: "Finding alternatives…" },
  { phase: "culturalNotes", label: "Adding cultural notes…" },
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
  const [saved, setSaved] = useState(false);
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
      setSaved(true);
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
        }, index * 100),
      );
    }
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [analysis?.sourceText, loading]);

  const submit = useCallback(async () => {
    const trimmed = sourceText.trim();
    if (!trimmed) {
      return;
    }

    setLoading(true);
    setEnrichmentLoading(true);
    setAnalysis(null);
    setSaved(false);
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
  }, [sourceText, toast]);

  const handleSave = useCallback(() => {
    if (!analysis) {
      return;
    }
    saveContextTranslationLesson(analysis);
    setSaved(true);
    toast("✓ Lesson saved", "success");
  }, [analysis, toast]);

  const handleStartOver = useCallback(() => {
    setAnalysis(null);
    setSourceText("");
    setSaved(false);
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
        saved={saved}
        followUpMessages={followUpMessages}
        followUpLoading={followUpLoading}
        onSave={handleSave}
        onStartOver={handleStartOver}
        onFollowUp={handleFollowUp}
      />
    );
  }

  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <Link
          href="/practice"
          className="focus-kb text-xs text-[var(--ink-muted)] underline-offset-2 hover:text-[var(--ink)] hover:underline"
        >
          ← Practice
        </Link>
        <Section eyebrow="Context Translation" title="Think like a native speaker.">
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-[var(--ink-secondary)]">
            Write a sentence in any language. Rossiyani explains how a native would think,
            phrase it, and why alternatives differ.
          </p>
        </Section>
      </header>

      <form
        className="mx-auto max-w-2xl space-y-6"
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        <textarea
          value={sourceText}
          onChange={(event) => setSourceText(event.target.value)}
          rows={5}
          disabled={loading}
          placeholder={"Write a sentence...\n\nExamples\n\nOn est foutu.\nWe're running late.\nМы сломаны."}
          className="focus-kb break-russian w-full resize-y border border-[var(--hairline)] bg-transparent px-4 py-5 text-center font-reader text-[clamp(1.125rem,3vw,1.5rem)] leading-relaxed text-[var(--ink)] outline-none placeholder:text-[var(--ink-muted)] disabled:opacity-60"
        />

        <div className="flex flex-wrap justify-center gap-2">
          {EXAMPLE_INPUTS.map((example) => (
            <button
              key={example}
              type="button"
              disabled={loading}
              onClick={() => setSourceText(example)}
              className="focus-kb border border-[var(--hairline)] px-3 py-1.5 text-sm text-[var(--ink-secondary)] transition hover:border-[var(--ink-muted)] hover:text-[var(--ink)] disabled:opacity-50"
            >
              {example}
            </button>
          ))}
        </div>

        <div className="text-center">
          <button
            type="submit"
            disabled={loading || !sourceText.trim()}
            className="focus-kb text-sm font-medium text-[var(--ink)] underline-offset-4 hover:underline disabled:opacity-40"
          >
            Translate &amp; Explain →
          </button>
        </div>
      </form>

      {loading && progressPhase ? (
        <div className="mx-auto max-w-md space-y-2 border-t border-[var(--hairline)] pt-6">
          {PROGRESS_STEPS.map((step) => {
            const stepIndex = PROGRESS_STEPS.findIndex((item) => item.phase === step.phase);
            const currentIndex = PROGRESS_STEPS.findIndex((item) => item.phase === progressPhase);
            const isDone = currentIndex > stepIndex || progressPhase === "complete";
            const isCurrent = step.phase === progressPhase;
            return (
              <p
                key={step.phase}
                className={[
                  "text-sm transition-colors",
                  isDone
                    ? "text-[var(--ink-secondary)]"
                    : isCurrent
                      ? "text-[var(--ink)]"
                      : "text-[var(--ink-muted)]/50",
                ].join(" ")}
              >
                {isDone ? "✓ " : isCurrent ? "… " : "  "}
                {step.label.replace("…", "")}
                {isCurrent && step.label.includes("…") ? "…" : ""}
              </p>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
