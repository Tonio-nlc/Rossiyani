export type LearnerLevel =
  | "discovering"
  | "alphabet"
  | "beginner"
  | "intermediate"
  | "unknown";

export type LearningGoal =
  | "travel"
  | "study"
  | "work"
  | "culture"
  | "family"
  | "curiosity"
  | "other";

export type ThemePreference = "light" | "dark" | "system";

export type OnboardingTranslationDefault = "manual" | "all" | "hidden";

export type LearnerProfile = {
  version: number;
  completedAt: string | null;
  level: LearnerLevel | null;
  goal: LearningGoal | null;
  theme: ThemePreference;
  translationDefault: OnboardingTranslationDefault;
  audioSpeed: number;
  firstTextId: string | null;
  readerCoachCompletedAt: string | null;
  updatedAt: string;
};

export type LearnerLevelOption = {
  id: LearnerLevel;
  label: string;
  description: string;
  cefrTargets: Array<"A1" | "A2" | "B1">;
};

export type LearningGoalOption = {
  id: LearningGoal;
  label: string;
};

export const LEARNER_LEVEL_OPTIONS: LearnerLevelOption[] = [
  {
    id: "discovering",
    label: "Je découvre le russe",
    description: "Premiers pas — on commence doucement.",
    cefrTargets: ["A1"],
  },
  {
    id: "alphabet",
    label: "Je connais déjà l'alphabet",
    description: "Je lis le cyrillique, mais peu de vocabulaire.",
    cefrTargets: ["A1"],
  },
  {
    id: "beginner",
    label: "Je suis débutant (A1)",
    description: "Phrases simples, vocabulaire de base.",
    cefrTargets: ["A1"],
  },
  {
    id: "intermediate",
    label: "Je suis intermédiaire (A2–B1)",
    description: "Je comprends des textes courts avec effort.",
    cefrTargets: ["A2", "B1"],
  },
  {
    id: "unknown",
    label: "Je ne sais pas",
    description: "Rossiyani choisira un texte accessible.",
    cefrTargets: ["A1", "A2"],
  },
];

export const LEARNING_GOAL_OPTIONS: LearningGoalOption[] = [
  { id: "travel", label: "Voyager" },
  { id: "study", label: "Étudier" },
  { id: "work", label: "Travailler" },
  { id: "culture", label: "Culture" },
  { id: "family", label: "Famille" },
  { id: "curiosity", label: "Curiosité" },
  { id: "other", label: "Autre" },
];

export const ONBOARDING_AUDIO_SPEED_OPTIONS = [
  { value: 0.75, label: "Lent" },
  { value: 1, label: "Normal" },
  { value: 1.25, label: "Rapide" },
] as const;

export const THEME_OPTIONS: Array<{ id: ThemePreference; label: string }> = [
  { id: "light", label: "Clair" },
  { id: "dark", label: "Sombre" },
  { id: "system", label: "Système" },
];

export const TRANSLATION_DEFAULT_OPTIONS: Array<{
  id: OnboardingTranslationDefault;
  label: string;
  description: string;
}> = [
  {
    id: "manual",
    label: "À la demande",
    description: "Vous ouvrez chaque traduction quand vous en avez besoin.",
  },
  {
    id: "all",
    label: "Visibles",
    description: "Les traductions s'affichent sous chaque phrase.",
  },
  {
    id: "hidden",
    label: "Masquées",
    description: "Lecture en russe seul — traductions disponibles au clic.",
  },
];
