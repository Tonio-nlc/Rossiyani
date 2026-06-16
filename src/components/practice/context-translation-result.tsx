"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";

import type {
  ContextTranslationAnalysis,
  ContextTranslationFollowUpMessage,
} from "@/lib/context-translation/types";

type SectionKey =
  | "best"
  | "think"
  | "naturalness"
  | "errors"
  | "alternatives"
  | "cultural"
  | "grammar"
  | "followup";

type ContextTranslationResultProps = {
  analysis: ContextTranslationAnalysis;
  visibleSections: number;
  enrichmentLoading: boolean;
  saved: boolean;
  followUpMessages: ContextTranslationFollowUpMessage[];
  followUpLoading: boolean;
  onSave: () => void;
  onStartOver: () => void;
  onFollowUp: (question: string) => Promise<void>;
};

function useSectionOrder(analysis: ContextTranslationAnalysis, enrichmentLoading: boolean) {
  return useMemo(() => {
    const order: SectionKey[] = ["best", "think"];
    if (analysis.naturalness) {
      order.push("naturalness");
    }
    if (analysis.corrections.length > 0) {
      order.push("errors");
    }
    order.push("alternatives");
    if (analysis.culturalNotes.length > 0) {
      order.push("cultural");
    }
    if (analysis.grammarConcepts.length > 0 || enrichmentLoading) {
      order.push("grammar");
    }
    order.push("followup");
    return order;
  }, [analysis, enrichmentLoading]);
}

function isSectionVisible(key: SectionKey, order: SectionKey[], visibleSections: number): boolean {
  const index = order.indexOf(key);
  if (index === -1) {
    return false;
  }
  return visibleSections > index;
}

function LessonSection({
  visible,
  label,
  children,
}: {
  visible: boolean;
  label: string;
  children: React.ReactNode;
}) {
  if (!visible) {
    return null;
  }

  return (
    <section className="animate-fade-up space-y-4 border-t border-[var(--hairline)] pt-8 first:border-t-0 first:pt-0">
      <p className="home-section-label">{label}</p>
      {children}
    </section>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [text]);

  return (
    <button
      type="button"
      onClick={() => void copy()}
      className="focus-kb text-xs text-[var(--ink-muted)] underline-offset-2 hover:text-[var(--ink)] hover:underline"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function NaturalnessBar({ score }: { score: number }) {
  const filled = Math.round(score / 10);
  return (
    <div className="flex items-center gap-3 font-mono text-sm tracking-wider text-[var(--ink-secondary)]">
      <span aria-hidden>{Array.from({ length: 10 }, (_, index) => (index < filled ? "█" : "░")).join("")}</span>
      <span className="font-sans text-xs text-[var(--ink-muted)]">{score}%</span>
    </div>
  );
}

const REGISTER_LABELS: Record<string, string> = {
  neutral: "Neutral",
  informal: "Informal",
  spoken: "Spoken",
  literary: "Literary",
  formal: "Formal",
};

const REGISTER_ORDER = ["neutral", "informal", "spoken", "literary", "formal"];

function FollowUpPanel({
  visible,
  messages,
  loading,
  onSubmit,
}: {
  visible: boolean;
  messages: ContextTranslationFollowUpMessage[];
  loading: boolean;
  onSubmit: (question: string) => Promise<void>;
}) {
  const [question, setQuestion] = useState("");

  if (!visible) {
    return null;
  }

  return (
    <section className="animate-fade-up space-y-4 border-t border-[var(--hairline)] pt-8">
      <p className="home-section-label">Ask a follow-up question</p>

      {messages.length > 0 ? (
        <ul className="space-y-4">
          {messages.map((message, index) => (
            <li
              key={`${message.role}-${index}`}
              className={[
                "text-sm leading-relaxed",
                message.role === "user"
                  ? "text-[var(--ink)]"
                  : "text-[var(--ink-secondary)]",
              ].join(" ")}
            >
              {message.content}
            </li>
          ))}
        </ul>
      ) : null}

      <form
        className="space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          const trimmed = question.trim();
          if (!trimmed || loading) {
            return;
          }
          setQuestion("");
          void onSubmit(trimmed);
        }}
      >
        <input
          type="text"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          disabled={loading}
          placeholder="Can I say this to my boss?"
          className="focus-kb w-full border-b border-[var(--hairline)] bg-transparent py-2 text-sm text-[var(--ink)] outline-none placeholder:text-[var(--ink-muted)] disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="focus-kb text-sm text-[var(--ink-muted)] underline-offset-2 hover:text-[var(--ink)] hover:underline disabled:opacity-40"
        >
          {loading ? "Thinking…" : "Ask"}
        </button>
      </form>
    </section>
  );
}

export function ContextTranslationResult({
  analysis,
  visibleSections,
  enrichmentLoading,
  saved,
  followUpMessages,
  followUpLoading,
  onSave,
  onStartOver,
  onFollowUp,
}: ContextTranslationResultProps) {
  const sectionOrder = useSectionOrder(analysis, enrichmentLoading);
  const { thinkLikeNative } = analysis;
  const alternativesByRegister = REGISTER_ORDER.map((register) => ({
    register,
    items: analysis.alternatives.filter((alt) => alt.register === register),
  })).filter((group) => group.items.length > 0);

  const show = (key: SectionKey) => isSectionVisible(key, sectionOrder, visibleSections);

  return (
    <article className="mx-auto max-w-2xl space-y-0 pb-16">
      <header className="mb-10 space-y-4">
        <Link
          href="/practice"
          className="focus-kb text-xs text-[var(--ink-muted)] underline-offset-2 hover:text-[var(--ink)] hover:underline"
        >
          ← Practice
        </Link>
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--ink-muted)]">
          Context Translation
        </p>
        <p className="text-sm text-[var(--ink-secondary)]">{analysis.sourceText}</p>
      </header>

      <LessonSection visible={show("best")} label="Best native translation">
        <p className="break-russian font-reader text-[clamp(1.75rem,4vw,2.5rem)] leading-tight text-[var(--ink)]">
          {analysis.bestTranslation}
        </p>
        <CopyButton text={analysis.bestTranslation} />
      </LessonSection>

      <LessonSection visible={show("think")} label="Think like a native">
        <div className="space-y-6 text-sm leading-relaxed">
          <div className="space-y-2">
            <p className="text-xs text-[var(--ink-muted)]">
              {thinkLikeNative.sourceLanguageLabel} thought
            </p>
            <p className="font-reader text-base text-[var(--ink)]">
              &ldquo;{thinkLikeNative.sourceThought}&rdquo;
            </p>
          </div>

          <p className="text-center text-[var(--ink-muted)]" aria-hidden>
            ↓
          </p>

          <div className="space-y-2">
            <p className="text-xs text-[var(--ink-muted)]">Mental image</p>
            <p className="text-[var(--ink-secondary)]">
              &ldquo;{thinkLikeNative.mentalImage}&rdquo;
            </p>
          </div>

          <div className="border-t border-[var(--hairline)] pt-6" />

          <div className="space-y-2">
            <p className="text-xs text-[var(--ink-muted)]">Native Russian thought</p>
            <p className="text-[var(--ink-secondary)]">
              &ldquo;{thinkLikeNative.nativeThought}&rdquo;
            </p>
          </div>

          <p className="text-center text-[var(--ink-muted)]" aria-hidden>
            ↓
          </p>

          <p className="break-russian font-reader text-xl text-[var(--ink)]">
            {thinkLikeNative.nativeFormulation}
          </p>

          <p className="border-t border-[var(--hairline)] pt-4 text-[var(--ink-secondary)]">
            {thinkLikeNative.conceptualShift}
          </p>
        </div>
      </LessonSection>

      {analysis.naturalness ? (
        <LessonSection visible={show("naturalness")} label="Naturalness">
          <NaturalnessBar score={analysis.naturalness.score} />
          <p className="text-sm leading-relaxed text-[var(--ink-secondary)]">
            {analysis.naturalness.explanation}
          </p>
          {analysis.naturalness.preferredExpression ? (
            <div className="space-y-1 pt-2">
              <p className="text-xs text-[var(--ink-muted)]">Preferred expression</p>
              <p className="break-russian font-reader text-lg text-[var(--ink)]">
                {analysis.naturalness.preferredExpression}
              </p>
            </div>
          ) : null}
        </LessonSection>
      ) : null}

      {analysis.corrections.length > 0 ? (
        <LessonSection visible={show("errors")} label="Error analysis">
          <ul className="space-y-8">
            {analysis.corrections.map((item) => (
              <li key={`${item.userText}-${item.correction}`} className="space-y-3">
                <p className="break-russian font-reader text-lg text-[var(--ink)]">{item.userText}</p>
                <dl className="space-y-2 text-sm">
                  <div>
                    <dt className="text-[var(--ink-muted)]">Problem</dt>
                    <dd className="mt-0.5 text-[var(--ink-secondary)]">{item.problem}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--ink-muted)]">What natives understand</dt>
                    <dd className="mt-0.5 text-[var(--ink-secondary)]">{item.nativeInterpretation}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--ink-muted)]">Native correction</dt>
                    <dd className="mt-0.5 break-russian font-reader text-[var(--ink)]">
                      {item.correction}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[var(--ink-muted)]">Reason</dt>
                    <dd className="mt-0.5 text-[var(--ink-secondary)]">{item.reason}</dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>
        </LessonSection>
      ) : null}

      <LessonSection visible={show("alternatives")} label="Alternative expressions">
          {enrichmentLoading && analysis.alternatives.length === 0 ? (
            <p className="text-sm text-[var(--ink-muted)]">Finding alternatives…</p>
          ) : alternativesByRegister.length > 0 ? (
            <ul className="space-y-6">
              {alternativesByRegister.map((group, groupIndex) => (
                <li key={group.register}>
                  {groupIndex > 0 ? (
                    <div className="mb-6 border-t border-[var(--hairline)]" aria-hidden />
                  ) : null}
                  <p className="text-xs text-[var(--ink-muted)]">
                    {REGISTER_LABELS[group.register] ?? group.register}
                  </p>
                  <ul className="mt-3 space-y-5">
                    {group.items.map((alt) => (
                      <li key={`${alt.register}-${alt.text}`} className="space-y-1">
                        <p className="break-russian font-reader text-lg text-[var(--ink)]">{alt.text}</p>
                        <p className="text-sm text-[var(--ink-secondary)]">{alt.nuance}</p>
                        <p className="text-xs text-[var(--ink-muted)]">
                          {alt.frequency} · {alt.whenToUse}
                        </p>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          ) : null}
      </LessonSection>

      {analysis.culturalNotes.length > 0 ? (
        <LessonSection visible={show("cultural")} label="Cultural notes">
          <ul className="space-y-2 text-sm leading-relaxed text-[var(--ink-secondary)]">
            {analysis.culturalNotes.map((note) => (
              <li key={note} className="flex gap-2">
                <span className="text-[var(--ink-muted)]" aria-hidden>
                  •
                </span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </LessonSection>
      ) : null}

      {analysis.grammarConcepts.length > 0 ? (
        <LessonSection visible={show("grammar")} label="Grammar & language concepts">
          <ul className="divide-y divide-[var(--hairline)]">
            {analysis.grammarConcepts.map((concept) => (
              <li key={concept.label}>
                {concept.href ? (
                  <Link
                    href={concept.href}
                    className="focus-kb group flex items-baseline justify-between gap-4 py-3"
                  >
                    <span className="text-sm text-[var(--ink)] group-hover:text-[var(--color-link)]">
                      {concept.label}
                    </span>
                    {concept.countLabel ? (
                      <span className="shrink-0 text-xs text-[var(--ink-muted)]">
                        {concept.countLabel}
                      </span>
                    ) : null}
                  </Link>
                ) : null}
              </li>
            ))}
          </ul>
        </LessonSection>
      ) : enrichmentLoading ? (
        <LessonSection visible={show("grammar")} label="Grammar & language concepts">
          <p className="text-sm text-[var(--ink-muted)]">Analyzing grammar…</p>
        </LessonSection>
      ) : null}

      <FollowUpPanel
        visible={show("followup")}
        messages={followUpMessages}
        loading={followUpLoading}
        onSubmit={onFollowUp}
      />

      <footer className="mt-12 flex flex-wrap items-center gap-4 border-t border-[var(--hairline)] pt-8">
        <button
          type="button"
          onClick={onSave}
          disabled={saved || enrichmentLoading}
          className="focus-kb text-sm text-[var(--ink-muted)] underline-offset-2 hover:text-[var(--ink)] hover:underline disabled:opacity-50"
        >
          {saved ? "✓ Lesson saved" : "Save lesson"}
        </button>
        <button
          type="button"
          onClick={onStartOver}
          className="focus-kb text-sm text-[var(--ink-muted)] underline-offset-2 hover:text-[var(--ink)] hover:underline"
        >
          New sentence →
        </button>
      </footer>
    </article>
  );
}
