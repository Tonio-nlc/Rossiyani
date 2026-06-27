"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import type { TextListItem } from "@/features/texts";
import {
  applyOnboardingPreferences,
  completeOnboarding,
  LEARNER_LEVEL_OPTIONS,
  LEARNING_GOAL_OPTIONS,
  ONBOARDING_AUDIO_SPEED_OPTIONS,
  pickFirstOnboardingText,
  THEME_OPTIONS,
  TRANSLATION_DEFAULT_OPTIONS,
  type LearnerLevel,
  type LearningGoal,
  type OnboardingTranslationDefault,
  type ThemePreference,
} from "@/lib/onboarding";

import { OnboardingOption, OnboardingShell } from "./onboarding-shell";

const STEP_COUNT = 5;

type OnboardingFlowProps = {
  texts: TextListItem[];
};

export function OnboardingFlow({ texts }: OnboardingFlowProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [level, setLevel] = useState<LearnerLevel | null>(null);
  const [goal, setGoal] = useState<LearningGoal | null>(null);
  const [translationDefault, setTranslationDefault] =
    useState<OnboardingTranslationDefault>("manual");
  const [audioSpeed, setAudioSpeed] = useState(1);
  const [theme, setTheme] = useState<ThemePreference>("light");
  const [submitting, setSubmitting] = useState(false);

  const firstText = useMemo(() => {
    if (!level) {
      return null;
    }
    return pickFirstOnboardingText(texts, level);
  }, [level, texts]);

  const goNext = () => setStep((current) => Math.min(current + 1, STEP_COUNT - 1));
  const goBack = () => setStep((current) => Math.max(current - 1, 0));

  const finish = () => {
    if (!level || !goal || !firstText || submitting) {
      return;
    }
    setSubmitting(true);
    const profile = completeOnboarding({
      level,
      goal,
      theme,
      translationDefault,
      audioSpeed,
      firstTextId: firstText.id,
    });
    applyOnboardingPreferences(profile);
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("rossiyani:lastTextId", firstText.id);
    }
    router.replace(`/texts/${firstText.id}`);
  };

  if (step === 0) {
    return (
      <OnboardingShell
        step={step}
        total={STEP_COUNT}
        eyebrow="Étape 1 sur 5"
        title="Apprendre le russe par la lecture"
        lead="Rossiyani vous accompagne dans de vrais textes — mot par mot, phrase par phrase."
        footer={
          <>
            <span />
            <button type="button" className="onboarding__primary focus-kb" onClick={goNext}>
              Commencer
            </button>
          </>
        }
      >
        <ul className="onboarding__bullets">
          <li>Lire des textes authentiques, à votre rythme.</li>
          <li>Comprendre chaque mot et chaque phrase quand vous en avez besoin.</li>
          <li>Progresser naturellement — sans listes à mémoriser.</li>
        </ul>
      </OnboardingShell>
    );
  }

  if (step === 1) {
    return (
      <OnboardingShell
        step={step}
        total={STEP_COUNT}
        eyebrow="Étape 2 sur 5"
        title="Où en êtes-vous ?"
        lead="Cela nous aide à choisir votre premier texte."
        footer={
          <>
            <button type="button" className="onboarding__ghost focus-kb" onClick={goBack}>
              Retour
            </button>
            <button
              type="button"
              className="onboarding__primary focus-kb"
              disabled={!level}
              onClick={goNext}
            >
              Continuer
            </button>
          </>
        }
      >
        <div className="onboarding__options">
          {LEARNER_LEVEL_OPTIONS.map((option) => (
            <OnboardingOption
              key={option.id}
              label={option.label}
              description={option.description}
              selected={level === option.id}
              onSelect={() => setLevel(option.id)}
            />
          ))}
        </div>
      </OnboardingShell>
    );
  }

  if (step === 2) {
    return (
      <OnboardingShell
        step={step}
        total={STEP_COUNT}
        eyebrow="Étape 3 sur 5"
        title="Pourquoi apprenez-vous le russe ?"
        lead="Vos recommandations s'affineront avec le temps."
        footer={
          <>
            <button type="button" className="onboarding__ghost focus-kb" onClick={goBack}>
              Retour
            </button>
            <button
              type="button"
              className="onboarding__primary focus-kb"
              disabled={!goal}
              onClick={goNext}
            >
              Continuer
            </button>
          </>
        }
      >
        <div className="onboarding__options onboarding__options--grid">
          {LEARNING_GOAL_OPTIONS.map((option) => (
            <OnboardingOption
              key={option.id}
              label={option.label}
              selected={goal === option.id}
              onSelect={() => setGoal(option.id)}
            />
          ))}
        </div>
      </OnboardingShell>
    );
  }

  if (step === 3) {
    return (
      <OnboardingShell
        step={step}
        total={STEP_COUNT}
        eyebrow="Étape 4 sur 5"
        title="Quelques préférences"
        lead="Modifiables à tout moment dans les réglages."
        footer={
          <>
            <button type="button" className="onboarding__ghost focus-kb" onClick={goBack}>
              Retour
            </button>
            <button type="button" className="onboarding__primary focus-kb" onClick={goNext}>
              Continuer
            </button>
          </>
        }
      >
        <div className="onboarding__pref-group">
          <p className="onboarding__pref-label">Traductions</p>
          <div className="onboarding__options">
            {TRANSLATION_DEFAULT_OPTIONS.map((option) => (
              <OnboardingOption
                key={option.id}
                label={option.label}
                description={option.description}
                selected={translationDefault === option.id}
                onSelect={() => setTranslationDefault(option.id)}
              />
            ))}
          </div>
        </div>

        <div className="onboarding__pref-group">
          <p className="onboarding__pref-label">Vitesse audio</p>
          <div className="onboarding__chip-row">
            {ONBOARDING_AUDIO_SPEED_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                className={[
                  "onboarding__chip focus-kb",
                  audioSpeed === option.value ? "onboarding__chip--active" : "",
                ].join(" ")}
                onClick={() => setAudioSpeed(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="onboarding__pref-group">
          <p className="onboarding__pref-label">Thème</p>
          <div className="onboarding__chip-row">
            {THEME_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                className={[
                  "onboarding__chip focus-kb",
                  theme === option.id ? "onboarding__chip--active" : "",
                ].join(" ")}
                onClick={() => setTheme(option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </OnboardingShell>
    );
  }

  return (
    <OnboardingShell
      step={step}
      total={STEP_COUNT}
      eyebrow="Étape 5 sur 5"
      title="Votre première lecture"
      lead="Pas d'écran de bienvenue — on ouvre directement un texte adapté à vous."
      footer={
        <>
          <button type="button" className="onboarding__ghost focus-kb" onClick={goBack}>
            Retour
          </button>
          <button
            type="button"
            className="onboarding__primary focus-kb"
            disabled={!firstText || submitting}
            onClick={finish}
          >
            {submitting ? "Ouverture…" : "Lire maintenant"}
          </button>
        </>
      }
    >
      {firstText ? (
        <article className="onboarding__text-preview">
          <p className="onboarding__text-level">{firstText.level}</p>
          <h2 className="onboarding__text-title">{firstText.title}</h2>
          <p className="onboarding__text-meta">
            {firstText.sentenceCount} phrase{firstText.sentenceCount > 1 ? "s" : ""} · texte court
            pour débuter
          </p>
        </article>
      ) : (
        <p className="onboarding__empty">Aucun texte disponible pour l&apos;instant.</p>
      )}
    </OnboardingShell>
  );
}
