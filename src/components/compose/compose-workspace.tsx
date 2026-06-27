"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import {
  GhostButton,
  PracticeInput,
  PrimaryButton,
} from "@/components/design-system";
import { Reference } from "@/components/editorial";
import type { ComposeAnalysis, ComposeMode } from "@/lib/compose/types";
import {
  buildPostReadingExercises,
  getCompletedReadingTexts,
  getPostReadingExercise,
} from "@/lib/compose/build-post-reading-exercises";
import { isComposeMode } from "@/lib/compose/modes";
import { composePath } from "@/lib/compose/paths";
import {
  pickReformulationReference,
  pickTranslationPrompt,
} from "@/lib/compose/prompts-pool";
import { getSavedReaderWords } from "@/lib/reader/saved-words";

import { ComposeAnalysisView } from "./compose-analysis-view";
import { ComposeHub } from "./compose-hub";

function buildKnownWordsPayload(textId?: string | null) {
  const words = getSavedReaderWords();
  const filtered = textId ? words.filter((entry) => entry.textId === textId) : words;
  return filtered.slice(0, 40).map((entry) => ({
    word: entry.displayForm,
    lemma: entry.lemma,
    savedWordId: entry.id,
    textId: entry.textId,
  }));
}

export function ComposeWorkspace() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const modeParam = searchParams.get("mode");
  const mode = isComposeMode(modeParam) ? modeParam : null;

  const [frenchPrompt, setFrenchPrompt] = useState("");
  const [referenceRussian, setReferenceRussian] = useState("");
  const [russianText, setRussianText] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<ComposeAnalysis | null>(null);

  const textId = searchParams.get("textId");
  const exerciseId = searchParams.get("exercise");

  const postReadingExercise = useMemo(() => {
    if (mode !== "post_reading" || !textId || !exerciseId) {
      return null;
    }
    return getPostReadingExercise(textId, exerciseId);
  }, [exerciseId, mode, textId]);

  const postReadingExercises = useMemo(() => {
    if (mode !== "post_reading" || !textId) {
      return [];
    }
    return buildPostReadingExercises(textId);
  }, [mode, textId]);

  useEffect(() => {
    if (!mode) {
      return;
    }

    setAnalysis(null);
    setRussianText("");

    if (mode === "translation") {
      setFrenchPrompt(pickTranslationPrompt(searchParams.get("prompt") ?? undefined));
      setReferenceRussian("");
      return;
    }

    if (mode === "reformulation") {
      setReferenceRussian(pickReformulationReference(searchParams.get("reference") ?? undefined));
      setFrenchPrompt("");
      return;
    }

    if (mode === "post_reading" && postReadingExercise) {
      setFrenchPrompt(postReadingExercise.frenchPrompt ?? "");
      setReferenceRussian(postReadingExercise.referenceRussian ?? "");
      return;
    }

    setFrenchPrompt("");
    setReferenceRussian("");
  }, [mode, postReadingExercise, searchParams]);

  const analyze = useCallback(async () => {
    if (!mode || !russianText.trim()) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/compose/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          russianText: russianText.trim(),
          frenchPrompt: frenchPrompt.trim() || undefined,
          referenceRussian: referenceRussian.trim() || undefined,
          context:
            mode === "post_reading" && postReadingExercise
              ? `Texte : ${postReadingExercise.textTitle}. ${postReadingExercise.hint ?? ""}`.trim()
              : undefined,
          knownWords: buildKnownWordsPayload(textId),
          register: "neutral",
        }),
      });

      if (!response.ok) {
        return;
      }

      const payload = (await response.json()) as { analysis: ComposeAnalysis };
      setAnalysis(payload.analysis);
    } finally {
      setLoading(false);
    }
  }, [frenchPrompt, mode, postReadingExercise, referenceRussian, russianText, textId]);

  const handlePracticeAgain = useCallback(() => {
    setAnalysis(null);
    setRussianText("");
  }, []);

  const handlePracticeAnother = useCallback(() => {
    setAnalysis(null);
    setRussianText("");
    if (mode === "post_reading" && textId && exerciseId) {
      const exercises = buildPostReadingExercises(textId);
      const currentIndex = exercises.findIndex((entry) => entry.id === exerciseId);
      const next = exercises[currentIndex + 1] ?? exercises[0];
      if (next && next.id !== exerciseId) {
        router.push(
          composePath({ mode: "post_reading", textId, exercise: next.id }),
        );
        return;
      }
    }
    if (mode === "translation") {
      router.push(composePath({ mode: "translation" }));
      return;
    }
    if (mode === "reformulation") {
      router.push(composePath({ mode: "reformulation" }));
    }
  }, [exerciseId, mode, router, textId]);

  if (!mode) {
    return (
      <div className="practice-shell pb-8">
        <ComposeHub />
      </div>
    );
  }

  if (mode === "post_reading" && !textId) {
    const completed = getCompletedReadingTexts();
    return (
      <div className="practice-shell compose-picker pb-8">
        <header className="compose-exercise-header">
          <p className="compose-exercise-header__eyebrow">Après lecture</p>
          <h1 className="compose-exercise-header__title">Choisissez un texte</h1>
          <p className="compose-exercise-header__lead">
            Sélectionnez un texte terminé pour générer des exercices ciblés.
          </p>
        </header>
        {completed.length === 0 ? (
          <ExerciseEmptyState message="Terminez un texte dans Reader pour débloquer ce mode." />
        ) : (
          <ul className="compose-recent-texts">
            {completed.map((text) => {
              const first = buildPostReadingExercises(text.textId)[0];
              if (!first) {
                return null;
              }
              return (
                <li key={text.textId}>
                  <Link
                    href={composePath({
                      mode: "post_reading",
                      textId: text.textId,
                      exercise: first.id,
                    })}
                    className="compose-recent-texts__link"
                  >
                    <span className="compose-recent-texts__title">{text.textTitle}</span>
                    <span className="compose-recent-texts__meta">{text.percent} % lu</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
        <Reference href="/compose">← Retour</Reference>
      </div>
    );
  }

  if (mode === "post_reading" && textId && !postReadingExercise) {
    return (
      <div className="practice-shell pb-8">
        <ExerciseEmptyState message="Exercice introuvable pour ce texte." />
        <Reference href={composePath({ mode: "post_reading" })}>Choisir un texte →</Reference>
      </div>
    );
  }

  if (analysis) {
    return (
      <ComposeAnalysisView
        mode={mode}
        analysis={analysis}
        originalSentence={russianText.trim()}
        frenchPrompt={frenchPrompt || postReadingExercise?.frenchPrompt}
        referenceRussian={referenceRussian || postReadingExercise?.referenceRussian}
        textId={textId}
        textTitle={postReadingExercise?.textTitle}
        onPracticeAgain={handlePracticeAgain}
        onPracticeAnother={handlePracticeAnother}
      />
    );
  }

  const modeTitles: Record<ComposeMode, { title: string; lead: string }> = {
    translation: {
      title: "Traduction",
      lead: "Traduisez la phrase en russe. Rossiyani analysera votre production.",
    },
    reformulation: {
      title: "Reformulation",
      lead: "Proposez une autre formulation naturelle de la phrase de référence.",
    },
    free: {
      title: "Rédaction libre",
      lead: "Écrivez librement. Compose analysera grammaire, vocabulaire et naturel.",
    },
    post_reading: {
      title: postReadingExercise?.title ?? "Après lecture",
      lead: postReadingExercise?.hint ?? "Réutilisez le vocabulaire et les structures du texte.",
    },
  };

  const copy = modeTitles[mode];

  return (
    <form
      className="practice-shell compose-exercise pb-8"
      onSubmit={(event) => {
        event.preventDefault();
        void analyze();
      }}
    >
      <header className="compose-exercise-header">
        <p className="compose-exercise-header__eyebrow">Compose</p>
        <h1 className="compose-exercise-header__title">{copy.title}</h1>
        <p className="compose-exercise-header__lead">{copy.lead}</p>
        <Reference href="/compose">← Tous les modes</Reference>
      </header>

      <div className="compose-exercise-layout">
        {mode === "translation" && frenchPrompt ? (
          <section className="compose-prompt-card" aria-label="Phrase à traduire">
            <p className="compose-prompt-card__label">À traduire</p>
            <p className="compose-prompt-card__text">« {frenchPrompt} »</p>
            <GhostButton
              type="button"
              onClick={() => setFrenchPrompt(pickTranslationPrompt())}
            >
              Autre phrase →
            </GhostButton>
          </section>
        ) : null}

        {mode === "reformulation" && referenceRussian ? (
          <section className="compose-prompt-card" aria-label="Phrase de référence">
            <p className="compose-prompt-card__label">Phrase de référence</p>
            <p className="compose-prompt-card__text break-russian font-reader">{referenceRussian}</p>
            <GhostButton
              type="button"
              onClick={() => setReferenceRussian(pickReformulationReference())}
            >
              Autre phrase →
            </GhostButton>
          </section>
        ) : null}

        {mode === "post_reading" && postReadingExercise ? (
          <section className="compose-prompt-card" aria-label="Consigne">
            <p className="compose-prompt-card__label">{postReadingExercise.textTitle}</p>
            {postReadingExercise.frenchPrompt ? (
              <p className="compose-prompt-card__text">« {postReadingExercise.frenchPrompt} »</p>
            ) : null}
            {postReadingExercise.referenceRussian ? (
              <p className="compose-prompt-card__text break-russian font-reader">
                {postReadingExercise.referenceRussian}
              </p>
            ) : null}
            {postReadingExercises.length > 1 ? (
              <div className="compose-exercise-tabs">
                {postReadingExercises.map((exercise, index) => (
                  <Link
                    key={exercise.id}
                    href={composePath({
                      mode: "post_reading",
                      textId: textId!,
                      exercise: exercise.id,
                    })}
                    className={[
                      "compose-exercise-tabs__item",
                      exercise.id === exerciseId ? "compose-exercise-tabs__item--active" : "",
                    ].join(" ")}
                  >
                    {index + 1}
                  </Link>
                ))}
              </div>
            ) : null}
          </section>
        ) : null}

        <div className="practice-field practice-field--writing">
          <PracticeInput
            id="compose-russian"
            label="Votre phrase en russe"
            value={russianText}
            onChange={(event) => setRussianText(event.target.value)}
            rows={5}
            required
            placeholder="Ваше предложение…"
            autoFocus
          />
        </div>

        <div className="practice-actions">
          <PrimaryButton
            type="submit"
            variant="gold"
            disabled={loading || !russianText.trim()}
          >
            {loading ? "Analyse…" : "Analyser →"}
          </PrimaryButton>
        </div>
      </div>
    </form>
  );
}

function ExerciseEmptyState({ message }: { message: string }) {
  return (
    <section className="compose-prompt-card compose-prompt-card--empty">
      <p className="compose-prompt-card__text">{message}</p>
    </section>
  );
}
