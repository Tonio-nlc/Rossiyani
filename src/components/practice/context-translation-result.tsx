"use client";

import Link from "next/link";
import { useCallback, useMemo, useState, type ChangeEvent, type FormEvent } from "react";

import { GhostButton, InputField, PrimaryButton } from "@/components/design-system";
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

import { PracticeExerciseHeader } from "./practice-exercise-header";
import { PracticeMicroscopePanel } from "./practice-microscope-panel";

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
    <section className="practice-section animate-fade-up-subtle">
      <div className="practice-section__head">
        <h2 className="practice-section__label">{label}</h2>
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
    <li className="practice-grammar-row">
      <div className="practice-grammar-row__body">
        <Link href={concept.href} className="practice-grammar-row__link focus-kb">
          {concept.label}
        </Link>
        {concept.countLabel ? (
          <p className="practice-grammar-row__meta">{concept.countLabel}</p>
        ) : null}
      </div>
      <div className="practice-grammar-row__actions">
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
    <section className="practice-section animate-fade-up-subtle">
      <h2 className="practice-section__label">Poser une question</h2>

      {messages.length > 0 ? (
        <ul className="practice-followup-messages">
          {messages.map((message, index) => (
            <li
              key={`${message.role}-${index}`}
              className={[
                "practice-followup-messages__item",
                message.role === "user"
                  ? "practice-followup-messages__item--user"
                  : "practice-followup-messages__item--assistant",
              ].join(" ")}
            >
              {message.content}
            </li>
          ))}
        </ul>
      ) : null}

      <form className="practice-followup-form" onSubmit={handleSubmit}>
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

  return (
    <article className="practice-shell pb-8">
      <PracticeExerciseHeader
        exerciseType="Traduction contextualisée"
        title="Résultat"
        subtitle={analysis.sourceText}
      />

      <div className="practice-split-layout">
        <div className="practice-split-layout__main">
          {show("best") ? (
            <section className="practice-section animate-fade-up-subtle">
              <h2 className="practice-section__label">Meilleure formulation native</h2>
              <div className="practice-result-card practice-result-card--success">
                <p className="practice-result-card__sentence break-russian font-reader">
                  {analysis.bestTranslation}
                </p>

                {analysis.naturalness ? (
                  <div className="practice-learning-card">
                    <p className="practice-learning-card__text">
                      {naturalnessLabel(analysis.naturalness.score)}
                    </p>
                    {analysis.naturalness.score < 85 ? (
                      <p className="practice-learning-card__text">
                        {analysis.naturalness.explanation}
                      </p>
                    ) : null}
                    {analysis.naturalness.preferredExpression ? (
                      <p className="practice-result-card__structure break-russian font-reader">
                        {analysis.naturalness.preferredExpression}
                      </p>
                    ) : null}
                  </div>
                ) : (
                  <p className="practice-learning-card__text">Formulation native</p>
                )}

                <div className="practice-footer-actions">
                  <CopyButton text={analysis.bestTranslation} />
                  <GhostButton disabled={phraseSaved} onClick={handleSavePhrase}>
                    {phraseSaved ? "Enregistré" : "Enregistrer la phrase"}
                  </GhostButton>
                  <GhostButton disabled={savedLesson || enrichmentLoading} onClick={onSaveLesson}>
                    {savedLesson ? "Leçon enregistrée" : "Enregistrer la leçon"}
                  </GhostButton>
                </div>
              </div>
            </section>
          ) : null}

          <LessonSection visible={show("think")} label="Penser comme un natif">
            <div className="practice-learning-card">
              <div className="practice-think-grid">
                <div>
                  <p className="practice-think-grid__label">
                    Pensée {thinkLikeNative.sourceLanguageLabel.toLowerCase()}
                  </p>
                  <p className="practice-think-grid__quote font-reader">
                    &ldquo;{thinkLikeNative.sourceThought}&rdquo;
                  </p>
                </div>

                <div>
                  <p className="practice-think-grid__label">Image mentale</p>
                  <p className="practice-think-grid__quote">
                    &ldquo;{thinkLikeNative.mentalImage}&rdquo;
                  </p>
                </div>

                <div className="practice-think-grid__divider">
                  <p className="practice-think-grid__label">Pensée russe native</p>
                  <p className="practice-think-grid__quote">
                    &ldquo;{thinkLikeNative.nativeThought}&rdquo;
                  </p>
                </div>

                <p className="practice-result-card__sentence break-russian font-reader">
                  {thinkLikeNative.nativeFormulation}
                </p>

                <p className="practice-learning-card__text">{thinkLikeNative.conceptualShift}</p>
              </div>
            </div>
          </LessonSection>

          {analysis.corrections.length > 0 ? (
            <LessonSection visible={show("errors")} label="Analyse des erreurs">
              <ul className="practice-card-list">
                {analysis.corrections.map((item) => (
                  <li key={`${item.userText}-${item.correction}`}>
                    <div className="practice-learning-card practice-result-card--review">
                      <p className="practice-result-card__sentence break-russian font-reader">
                        {item.userText}
                      </p>
                      <dl className="practice-error-facts">
                        <div>
                          <dt>Problème</dt>
                          <dd>{item.problem}</dd>
                        </div>
                        <div>
                          <dt>Ce que comprennent les natifs</dt>
                          <dd>{item.nativeInterpretation}</dd>
                        </div>
                        <div>
                          <dt>Correction native</dt>
                          <dd className="break-russian font-reader">{item.correction}</dd>
                        </div>
                        <div>
                          <dt>Raison</dt>
                          <dd>{item.reason}</dd>
                        </div>
                      </dl>
                    </div>
                  </li>
                ))}
              </ul>
            </LessonSection>
          ) : null}

          <LessonSection visible={show("alternatives")} label="Expressions alternatives">
            {enrichmentLoading && analysis.alternatives.length === 0 ? (
              <p className="practice-learning-card__text">Recherche d&apos;alternatives…</p>
            ) : alternativesByRegister.length > 0 ? (
              <ul className="practice-alt-groups">
                {alternativesByRegister.map((group) => (
                  <li key={group.register}>
                    <p className="practice-alt-groups__register">
                      {REGISTER_LABELS[group.register] ?? group.register}
                    </p>
                    <ul className="practice-card-list">
                      {group.items.map((alt) => (
                        <li key={alt.text} className="practice-alt-row">
                          <div className="practice-alt-row__body">
                            <p className="practice-result-card__sentence break-russian font-reader">
                              {alt.text}
                            </p>
                            <p className="practice-learning-card__text">{alt.nuance}</p>
                            <p className="practice-alt-row__meta">
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
              <ul className="practice-card-list">
                {analysis.culturalNotes.map((note) => (
                  <li key={note} className="practice-note-row">
                    <div className="practice-learning-card">{note}</div>
                    <SaveNoteButton note={note} sourceSentence={analysis.sourceText} />
                  </li>
                ))}
              </ul>
            </LessonSection>
          ) : null}

          {analysis.grammarConcepts.length > 0 ? (
            <LessonSection visible={show("grammar")} label="Grammaire et concepts">
              <ul className="practice-grammar-list">
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
              <p className="practice-learning-card__text">Analyse grammaticale…</p>
            </LessonSection>
          ) : null}

          <FollowUpPanel
            visible={show("followup")}
            messages={followUpMessages}
            loading={followUpLoading}
            onSubmit={onFollowUp}
          />

          <footer className="practice-footer-submit">
            <PrimaryButton onClick={onStartOver}>Nouvelle phrase →</PrimaryButton>
          </footer>
        </div>

        <div className="practice-split-layout__aside">
          <PracticeMicroscopePanel analysis={analysis} loading={enrichmentLoading} />
        </div>
      </div>
    </article>
  );
}
