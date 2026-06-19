"use client";

import Link from "next/link";
import { useCallback, useMemo, useState, type ChangeEvent, type FormEvent } from "react";

import {
  GhostButton,
  InputField,
  PracticeMarginNote,
  PrimaryButton,
  SectionHeader,
} from "@/components/design-system";

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
    return "Sonorité parfaitement naturelle";
  }
  if (score >= 60) {
    return "Compréhensible, mais un peu rigide";
  }
  return "Formulation non native";
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
    <section className="editorial-page-section animate-fade-up-subtle space-y-3 border-t border-[var(--hairline)] pt-6 pb-0">
      <div className="flex items-baseline justify-between gap-4">
        <p className="text-eyebrow">{label}</p>
        {action}
      </div>
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
    <GhostButton onClick={() => void copy()} disabled={copied}>
      {copied ? "Copié" : "Copier"}
    </GhostButton>
  );
}

const REGISTER_LABELS: Record<string, string> = {
  neutral: "Neutre",
  informal: "Informel",
  spoken: "Parlé",
  literary: "Littéraire",
  formal: "Formel",
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
    <GhostButton
      disabled={saved}
      onClick={() => {
        saveContextTranslationPhrase({
          sourceSentence,
          russianPhrase,
          register,
          nuance,
        });
        setSaved(true);
      }}
    >
      {saved ? "Enregistré" : "Enregistrer"}
    </GhostButton>
  );
}

function SaveNoteButton({ note, sourceSentence }: { note: string; sourceSentence: string }) {
  const [saved, setSaved] = useState(() => isCulturalNoteSaved(note, sourceSentence));

  return (
    <GhostButton
      disabled={saved}
      onClick={() => {
        saveCulturalNote(note, sourceSentence);
        setSaved(true);
      }}
    >
      {saved ? "Enregistré" : "Enregistrer"}
    </GhostButton>
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
        <GhostButton href={concept.href}>Explorer →</GhostButton>
        <GhostButton
          disabled={saved}
          onClick={() => {
            saveGrammarConcept(concept.label, concept.href, sourceSentence);
            setSaved(true);
          }}
        >
          {saved ? "Enregistré" : "Enregistrer"}
        </GhostButton>
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

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = question.trim();
    if (!trimmed || loading) {
      return;
    }
    setQuestion("");
    void onSubmit(trimmed);
  };

  return (
    <section className="editorial-page-section animate-fade-up-subtle space-y-4 border-t border-[var(--hairline)] pt-6 pb-0">
      <p className="text-eyebrow">Poser une question</p>

      {messages.length > 0 ? (
        <ul className="space-y-3">
          {messages.map((message, index) => (
            <li
              key={`${message.role}-${index}`}
              className={[
                "text-sm leading-relaxed",
                message.role === "user" ? "text-[var(--ink)]" : "text-[var(--ink-muted)]",
              ].join(" ")}
            >
              {message.content}
            </li>
          ))}
        </ul>
      ) : null}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <InputField
          type="text"
          value={question}
          onChange={(event: ChangeEvent<HTMLInputElement>) => setQuestion(event.target.value)}
          disabled={loading}
          placeholder="Puis-je dire cela à mon patron ?"
        />
        <PrimaryButton type="submit" disabled={loading || !question.trim()}>
          {loading ? "Réflexion…" : "Demander →"}
        </PrimaryButton>
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
    <article className="pb-8">
      <header className="editorial-page-section pb-0">
        <GhostButton href="/practice">← Pratique</GhostButton>
        <div className="mt-4">
          <SectionHeader
            eyebrow="Traduction contextualisée"
            title="Résultat"
            description={analysis.sourceText}
          />
        </div>
      </header>

      {show("best") ? (
        <section className="editorial-page-section animate-fade-up-subtle space-y-4 border-t border-[var(--hairline)] pt-6 pb-0">
          <p className="text-eyebrow">Meilleure formulation native</p>
          <p className="editorial-lead-title break-russian leading-tight">
            {analysis.bestTranslation}
          </p>

          {analysis.naturalness ? (
            <PracticeMarginNote>
              <p className="text-sm">{naturalnessLabel(analysis.naturalness.score)}</p>
              {analysis.naturalness.score < 85 ? (
                <p className="mt-2 leading-relaxed">{analysis.naturalness.explanation}</p>
              ) : null}
              {analysis.naturalness.preferredExpression ? (
                <p className="mt-3 break-russian font-reader text-base text-[var(--ink)]">
                  {analysis.naturalness.preferredExpression}
                </p>
              ) : null}
            </PracticeMarginNote>
          ) : (
            <p className="text-sm text-[var(--ink-muted)]">Formulation native</p>
          )}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1">
            <CopyButton text={analysis.bestTranslation} />
            <GhostButton disabled={phraseSaved} onClick={handleSavePhrase}>
              {phraseSaved ? "Enregistré" : "Enregistrer la phrase"}
            </GhostButton>
            <GhostButton disabled={savedLesson || enrichmentLoading} onClick={handleSaveLesson}>
              {savedLesson ? "Leçon enregistrée" : "Enregistrer la leçon"}
            </GhostButton>
          </div>
        </section>
      ) : null}

      <LessonSection visible={show("think")} label="Penser comme un natif">
        <PracticeMarginNote>
          <div className="space-y-4 text-sm leading-relaxed">
            <div className="space-y-1.5">
              <p className="text-xs text-[var(--ink-muted)]">
                Pensée {thinkLikeNative.sourceLanguageLabel.toLowerCase()}
              </p>
              <p className="font-reader text-base text-[var(--ink)]">
                &ldquo;{thinkLikeNative.sourceThought}&rdquo;
              </p>
            </div>

            <div className="space-y-1.5">
              <p className="text-xs text-[var(--ink-muted)]">Image mentale</p>
              <p>&ldquo;{thinkLikeNative.mentalImage}&rdquo;</p>
            </div>

            <div className="border-t border-[var(--hairline)] pt-4">
              <p className="text-xs text-[var(--ink-muted)]">Pensée russe native</p>
              <p className="mt-1.5">&ldquo;{thinkLikeNative.nativeThought}&rdquo;</p>
            </div>

            <p className="break-russian font-reader text-xl text-[var(--ink)]">
              {thinkLikeNative.nativeFormulation}
            </p>

            <p className="border-t border-[var(--hairline)] pt-3">{thinkLikeNative.conceptualShift}</p>
          </div>
        </PracticeMarginNote>
      </LessonSection>

      {analysis.corrections.length > 0 ? (
        <LessonSection visible={show("errors")} label="Analyse des erreurs">
          <ul className="space-y-6">
            {analysis.corrections.map((item) => (
              <li key={`${item.userText}-${item.correction}`}>
                <PracticeMarginNote>
                  <p className="break-russian font-reader text-lg text-[var(--ink)]">{item.userText}</p>
                  <dl className="mt-3 space-y-2 text-sm">
                    <div>
                      <dt className="text-xs text-[var(--ink-muted)]">Problème</dt>
                      <dd className="mt-0.5">{item.problem}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-[var(--ink-muted)]">Ce que comprennent les natifs</dt>
                      <dd className="mt-0.5">{item.nativeInterpretation}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-[var(--ink-muted)]">Correction native</dt>
                      <dd className="mt-0.5 break-russian font-reader text-[var(--ink)]">
                        {item.correction}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-[var(--ink-muted)]">Raison</dt>
                      <dd className="mt-0.5">{item.reason}</dd>
                    </div>
                  </dl>
                </PracticeMarginNote>
              </li>
            ))}
          </ul>
        </LessonSection>
      ) : null}

      <LessonSection visible={show("alternatives")} label="Expressions alternatives">
        {enrichmentLoading && analysis.alternatives.length === 0 ? (
          <p className="text-sm text-[var(--ink-muted)]">Recherche d&apos;alternatives…</p>
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
                      key={alt.text}
                      className="flex items-start justify-between gap-4"
                    >
                      <div className="min-w-0 space-y-1">
                        <p className="break-russian font-reader text-lg text-[var(--ink)]">
                          {alt.text}
                        </p>
                        <p className="text-sm text-[var(--ink-muted)]">{alt.nuance}</p>
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
        <LessonSection visible={show("cultural")} label="Notes culturelles">
          <ul className="space-y-3 text-sm leading-relaxed">
            {analysis.culturalNotes.map((note) => (
              <li key={note} className="flex items-start justify-between gap-4">
                <PracticeMarginNote>{note}</PracticeMarginNote>
                <SaveNoteButton note={note} sourceSentence={analysis.sourceText} />
              </li>
            ))}
          </ul>
        </LessonSection>
      ) : null}

      {analysis.grammarConcepts.length > 0 ? (
        <LessonSection visible={show("grammar")} label="Grammaire et concepts">
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
        <LessonSection visible={show("grammar")} label="Grammaire et concepts">
          <p className="text-sm text-[var(--ink-muted)]">Analyse grammaticale…</p>
        </LessonSection>
      ) : null}

      <FollowUpPanel
        visible={show("followup")}
        messages={followUpMessages}
        loading={followUpLoading}
        onSubmit={onFollowUp}
      />

      <footer className="editorial-page-section flex justify-end border-t border-[var(--hairline)] pt-6">
        <PrimaryButton onClick={onStartOver}>Nouvelle phrase →</PrimaryButton>
      </footer>
    </article>
  );
}
