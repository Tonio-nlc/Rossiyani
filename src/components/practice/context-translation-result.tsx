"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";

import {
  isContextTranslationPhraseSaved,
  saveContextTranslationPhrase,
} from "@/lib/context-translation/save-actions";
import {
  isCulturalNoteSaved,
  isGrammarConceptSaved,
  saveCulturalNote,
  saveGrammarConcept,
} from "@/lib/context-translation/saved-items";
import type {
  ContextTranslationAnalysis,
  ContextTranslationAlternative,
  ContextTranslationFollowUpMessage,
  ContextTranslationGrammarConcept,
} from "@/lib/context-translation/types";

type SectionKey =
  | "best"
  | "think"
  | "errors"
  | "alternatives"
  | "cultural"
  | "grammar"
  | "followup";

type ContextTranslationResultProps = {
  analysis: ContextTranslationAnalysis;
  visibleSections: number;
  enrichmentLoading: boolean;
  savedLesson: boolean;
  followUpMessages: ContextTranslationFollowUpMessage[];
  followUpLoading: boolean;
  onSaveLesson: () => void;
  onStartOver: () => void;
  onFollowUp: (question: string) => Promise<void>;
};

function useSectionOrder(analysis: ContextTranslationAnalysis, enrichmentLoading: boolean) {
  return useMemo(() => {
    const order: SectionKey[] = ["best", "think"];
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

function naturalnessLabel(score: number): string {
  if (score >= 85) {
    return "Sounds completely natural";
  }
  if (score >= 60) {
    return "Understandable but stiff";
  }
  return "Non-native phrasing";
}

function LessonSection({
  visible,
  label,
  action,
  children,
}: {
  visible: boolean;
  label: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  if (!visible) {
    return null;
  }

  return (
    <section className="animate-fade-up-subtle space-y-3 border-t border-[var(--hairline)] pt-6 first:border-t-0 first:pt-0">
      <div className="flex items-baseline justify-between gap-4">
        <p className="home-section-label">{label}</p>
        {action}
      </div>
      {children}
    </section>
  );
}

function InlineAction({
  label,
  activeLabel,
  active,
  onClick,
  disabled,
}: {
  label: string;
  activeLabel: string;
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || active}
      className="focus-kb text-xs text-[var(--ink-muted)] underline-offset-2 transition hover:text-[var(--ink)] hover:underline disabled:opacity-50"
    >
      {active ? activeLabel : label}
    </button>
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
    <InlineAction
      label="Copy"
      activeLabel="Copied ✓"
      active={copied}
      onClick={() => void copy()}
    />
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

function SavePhraseButton({
  sourceSentence,
  russianPhrase,
  register,
  nuance,
}: {
  sourceSentence: string;
  russianPhrase: string;
  register?: ContextTranslationAlternative["register"];
  nuance?: string;
}) {
  const [saved, setSaved] = useState(() =>
    isContextTranslationPhraseSaved(sourceSentence, russianPhrase),
  );

  return (
    <InlineAction
      label="Save"
      activeLabel="Saved ✓"
      active={saved}
      onClick={() => {
        saveContextTranslationPhrase({
          sourceSentence,
          russianPhrase,
          register,
          nuance,
        });
        setSaved(true);
      }}
    />
  );
}

function SaveNoteButton({ note, sourceSentence }: { note: string; sourceSentence: string }) {
  const [saved, setSaved] = useState(() => isCulturalNoteSaved(note, sourceSentence));

  return (
    <InlineAction
      label="Save note"
      activeLabel="Saved ✓"
      active={saved}
      onClick={() => {
        saveCulturalNote(note, sourceSentence);
        setSaved(true);
      }}
    />
  );
}

function GrammarConceptRow({
  concept,
  sourceSentence,
}: {
  concept: ContextTranslationGrammarConcept;
  sourceSentence: string;
}) {
  const [saved, setSaved] = useState(() =>
    isGrammarConceptSaved(concept.label, sourceSentence),
  );

  if (!concept.href) {
    return null;
  }

  return (
    <li className="flex items-center justify-between gap-4 py-2.5">
      <div className="min-w-0 flex-1">
        <Link
          href={concept.href}
          className="focus-kb text-sm text-[var(--ink)] underline-offset-2 hover:text-[var(--color-link)] hover:underline"
        >
          {concept.label}
        </Link>
        {concept.countLabel ? (
          <p className="mt-0.5 text-xs text-[var(--ink-muted)]">{concept.countLabel}</p>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <Link
          href={concept.href}
          className="focus-kb text-xs text-[var(--ink-muted)] underline-offset-2 hover:text-[var(--ink)] hover:underline"
        >
          Open Explorer
        </Link>
        <InlineAction
          label="Save concept"
          activeLabel="Saved ✓"
          active={saved}
          onClick={() => {
            saveGrammarConcept(concept.label, concept.href, sourceSentence);
            setSaved(true);
          }}
        />
      </div>
    </li>
  );
}

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
    <section className="animate-fade-up-subtle space-y-3 border-t border-[var(--hairline)] pt-6">
      <p className="home-section-label">Ask a follow-up question</p>

      {messages.length > 0 ? (
        <ul className="space-y-3">
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
        className="space-y-2"
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
  savedLesson,
  followUpMessages,
  followUpLoading,
  onSaveLesson,
  onStartOver,
  onFollowUp,
}: ContextTranslationResultProps) {
  const sectionOrder = useSectionOrder(analysis, enrichmentLoading);
  const { thinkLikeNative } = analysis;
  const [phraseSaved, setPhraseSaved] = useState(() =>
    isContextTranslationPhraseSaved(analysis.sourceText, analysis.bestTranslation),
  );

  const alternativesByRegister = REGISTER_ORDER.map((register) => ({
    register,
    items: analysis.alternatives.filter((alt) => alt.register === register),
  })).filter((group) => group.items.length > 0);

  const show = (key: SectionKey) => isSectionVisible(key, sectionOrder, visibleSections);

  const handleSavePhrase = useCallback(() => {
    saveContextTranslationPhrase({
      sourceSentence: analysis.sourceText,
      russianPhrase: analysis.bestTranslation,
      nuance: thinkLikeNative.conceptualShift,
    });
    setPhraseSaved(true);
  }, [analysis.bestTranslation, analysis.sourceText, thinkLikeNative.conceptualShift]);

  const handleSaveLesson = useCallback(() => {
    onSaveLesson();
  }, [onSaveLesson]);

  return (
    <article className="mx-auto max-w-2xl space-y-0 pb-12">
      <header className="mb-7 space-y-3">
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

      {show("best") ? (
        <section className="animate-fade-up-subtle space-y-3 border-t border-[var(--hairline)] pt-6">
          <p className="home-section-label">Best native translation</p>
          <p className="break-russian font-reader text-[clamp(1.75rem,4vw,2.35rem)] leading-tight text-[var(--ink)]">
            {analysis.bestTranslation}
          </p>

          {analysis.naturalness ? (
            <div className="space-y-2">
              <p className="text-sm text-[var(--ink-secondary)]">
                {analysis.naturalness.score >= 85 ? "✓ " : ""}
                {naturalnessLabel(analysis.naturalness.score)}
              </p>
              {analysis.naturalness.score < 85 ? (
                <p className="text-sm leading-relaxed text-[var(--ink-secondary)]">
                  {analysis.naturalness.explanation}
                </p>
              ) : null}
              {analysis.naturalness.preferredExpression ? (
                <p className="break-russian font-reader text-base text-[var(--ink)]">
                  {analysis.naturalness.preferredExpression}
                </p>
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-[var(--ink-secondary)]">Native formulation</p>
          )}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1">
            <CopyButton text={analysis.bestTranslation} />
            <InlineAction
              label="Save phrase"
              activeLabel="Saved ✓"
              active={phraseSaved}
              onClick={handleSavePhrase}
            />
            <InlineAction
              label="Save lesson"
              activeLabel="Saved to Library ✓"
              active={savedLesson}
              disabled={enrichmentLoading}
              onClick={handleSaveLesson}
            />
          </div>
        </section>
      ) : null}

      <LessonSection visible={show("think")} label="Think like a native">
        <div className="space-y-4 text-sm leading-relaxed">
          <div className="space-y-1.5">
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

          <div className="space-y-1.5">
            <p className="text-xs text-[var(--ink-muted)]">Mental image</p>
            <p className="text-[var(--ink-secondary)]">
              &ldquo;{thinkLikeNative.mentalImage}&rdquo;
            </p>
          </div>

          <div className="border-t border-[var(--hairline)] pt-4" />

          <div className="space-y-1.5">
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

          <p className="border-t border-[var(--hairline)] pt-3 text-[var(--ink-secondary)]">
            {thinkLikeNative.conceptualShift}
          </p>
        </div>
      </LessonSection>

      {analysis.corrections.length > 0 ? (
        <LessonSection visible={show("errors")} label="Error analysis">
          <ul className="space-y-6">
            {analysis.corrections.map((item) => (
              <li key={`${item.userText}-${item.correction}`} className="space-y-2.5">
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
          <ul className="space-y-5">
            {alternativesByRegister.map((group, groupIndex) => (
              <li key={group.register}>
                {groupIndex > 0 ? (
                  <div className="mb-5 border-t border-[var(--hairline)]" aria-hidden />
                ) : null}
                <p className="text-xs text-[var(--ink-muted)]">
                  {REGISTER_LABELS[group.register] ?? group.register}
                </p>
                <ul className="mt-2.5 space-y-4">
                  {group.items.map((alt) => (
                    <li
                      key={`${alt.register}-${alt.text}`}
                      className="flex items-start justify-between gap-4"
                    >
                      <div className="min-w-0 space-y-1">
                        <p className="break-russian font-reader text-lg text-[var(--ink)]">
                          {alt.text}
                        </p>
                        <p className="text-sm text-[var(--ink-secondary)]">{alt.nuance}</p>
                        <p className="text-xs text-[var(--ink-muted)]">
                          {alt.frequency} · {alt.whenToUse}
                        </p>
                      </div>
                      <SavePhraseButton
                        sourceSentence={analysis.sourceText}
                        russianPhrase={alt.text}
                        register={alt.register}
                        nuance={alt.nuance}
                      />
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
          <ul className="space-y-3 text-sm leading-relaxed text-[var(--ink-secondary)]">
            {analysis.culturalNotes.map((note) => (
              <li key={note} className="flex items-start justify-between gap-4">
                <span className="flex gap-2">
                  <span className="text-[var(--ink-muted)]" aria-hidden>
                    •
                  </span>
                  <span>{note}</span>
                </span>
                <SaveNoteButton note={note} sourceSentence={analysis.sourceText} />
              </li>
            ))}
          </ul>
        </LessonSection>
      ) : null}

      {analysis.grammarConcepts.length > 0 ? (
        <LessonSection visible={show("grammar")} label="Grammar & language concepts">
          <ul className="divide-y divide-[var(--hairline)]">
            {analysis.grammarConcepts.map((concept) => (
              <GrammarConceptRow
                key={concept.label}
                concept={concept}
                sourceSentence={analysis.sourceText}
              />
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

      <footer className="mt-8 border-t border-[var(--hairline)] pt-6">
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
