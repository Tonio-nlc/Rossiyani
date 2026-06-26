import {
  MANUAL_CATEGORY_LABELS,
  MANUAL_CURRICULUM_CASES,
  MANUAL_LEVEL_LABELS,
  type ManualCategory,
  type ManualLevel,
} from "@/features/manual";

import { lessonsCurriculumPath, lessonsLevelPath, lessonsThemePath } from "./paths";

export type LessonsCollectionKind = "level" | "theme" | "curriculum" | "featured";

export type LessonsCollection = {
  id: string;
  title: string;
  description: string;
  href: string;
  kind: LessonsCollectionKind;
  accent: string;
  glow: string;
  icon: "foundation" | "grammar" | "verbs" | "culture" | "speech" | "cases" | "travel" | "writing";
  difficulty?: string;
};

const HOMEPAGE_COLLECTIONS: LessonsCollection[] = [
  {
    id: "foundations",
    title: "Fondations du russe",
    description: "Alphabet, prononciation et premières structures — idéal pour démarrer.",
    href: lessonsLevelPath("a1"),
    kind: "featured",
    accent: "#0ea5e9",
    glow: "rgba(14, 165, 233, 0.14)",
    icon: "foundation",
    difficulty: "A1",
  },
  {
    id: "cases",
    title: "Les six cas",
    description: "La logique des déclinaisons, pilier de la grammaire russe.",
    href: lessonsThemePath("declensions"),
    kind: "curriculum",
    accent: "#6366f1",
    glow: "rgba(99, 102, 241, 0.14)",
    icon: "cases",
    difficulty: "A1–B2",
  },
  {
    id: "verbs",
    title: "Verbes & aspect",
    description: "Conjugaisons, aspect et verbes de mouvement en contexte.",
    href: lessonsThemePath("verbs"),
    kind: "theme",
    accent: "#059669",
    glow: "rgba(5, 150, 105, 0.14)",
    icon: "verbs",
    difficulty: "A2–B2",
  },
  {
    id: "everyday",
    title: "Russe du quotidien",
    description: "Expressions et communication pour parler naturellement.",
    href: lessonsThemePath("expressions"),
    kind: "theme",
    accent: "#d97706",
    glow: "rgba(217, 119, 6, 0.14)",
    icon: "speech",
    difficulty: "A1–B1",
  },
  {
    id: "culture",
    title: "Culture & civilisation",
    description: "Contexte culturel et nuances qui donnent vie à la langue.",
    href: lessonsThemePath("culture"),
    kind: "theme",
    accent: "#db2777",
    glow: "rgba(219, 39, 119, 0.12)",
    icon: "culture",
    difficulty: "Tous niveaux",
  },
];

/** Curated entry points — homepage only, no overlap with lesson grids below. */
export function getHomepageCollections(): LessonsCollection[] {
  return HOMEPAGE_COLLECTIONS;
}

const FEATURED_COLLECTIONS: LessonsCollection[] = [
  ...HOMEPAGE_COLLECTIONS,
  {
    id: "motion",
    title: "Verbes de mouvement",
    description: "Идти, ехать, ходить — maîtriser l'espace et le déplacement en russe.",
    href: lessonsThemePath("motion-verbs"),
    kind: "theme",
    accent: "#0891b2",
    glow: "rgba(8, 145, 178, 0.14)",
    icon: "travel",
    difficulty: "A2–B1",
  },
  {
    id: "pronunciation",
    title: "Prononciation",
    description: "Sons, accent tonique et fluidité — entraîner l'oreille et la bouche.",
    href: lessonsThemePath("pronunciation"),
    kind: "theme",
    accent: "#7c3aed",
    glow: "rgba(124, 58, 237, 0.12)",
    icon: "writing",
    difficulty: "A1–A2",
  },
];

export function getFeaturedCollections(): LessonsCollection[] {
  return FEATURED_COLLECTIONS;
}

export function getCollectionById(id: string): LessonsCollection | null {
  return FEATURED_COLLECTIONS.find((item) => item.id === id) ?? null;
}

export function getLevelCollections(): LessonsCollection[] {
  return (Object.keys(MANUAL_LEVEL_LABELS) as ManualLevel[]).map((level) => ({
    id: `level-${level}`,
    title: MANUAL_LEVEL_LABELS[level],
    description: `Leçons classées niveau ${level.toUpperCase()} — progression structurée.`,
    href: lessonsLevelPath(level),
    kind: "level" as const,
    accent: "#475569",
    glow: "rgba(71, 85, 105, 0.1)",
    icon: "foundation" as const,
    difficulty: level.toUpperCase(),
  }));
}

export function getGrammarCollections(): LessonsCollection[] {
  return MANUAL_CURRICULUM_CASES.map((grammarCase) => ({
    id: `case-${grammarCase.id}`,
    title: grammarCase.name,
    description: grammarCase.description,
    href: lessonsCurriculumPath(grammarCase.id),
    kind: "curriculum" as const,
    accent: "#6366f1",
    glow: "rgba(99, 102, 241, 0.12)",
    icon: "cases" as const,
  }));
}

export function getThemeCollection(category: ManualCategory): LessonsCollection {
  return {
    id: `theme-${category}`,
    title: MANUAL_CATEGORY_LABELS[category],
    description: `Parcours ${MANUAL_CATEGORY_LABELS[category].toLowerCase()} — leçons thématiques.`,
    href: lessonsThemePath(category),
    kind: "theme",
    accent: "#64748b",
    glow: "rgba(100, 116, 139, 0.1)",
    icon: "grammar",
  };
}
