export const MANUAL_LEVELS = ["a1", "a2", "b1", "b2", "c1", "c2"] as const;

/** Curriculum tracks — target lesson counts for V1. */
export const MANUAL_CATEGORIES = [
  "pronunciation",
  "alphabet",
  "accent",
  "declensions",
  "prepositions",
  "verbs",
  "aspect",
  "motion-verbs",
  "pronouns",
  "adjectives",
  "numerals",
  "syntax",
  "expressions",
  "communication",
  "register",
  "culture",
] as const;

export type ManualLevel = (typeof MANUAL_LEVELS)[number];
export type ManualCategory = (typeof MANUAL_CATEGORIES)[number];

export const MANUAL_LEVEL_LABELS: Record<ManualLevel, string> = {
  a1: "A1 — Débutant",
  a2: "A2 — Élémentaire",
  b1: "B1 — Intermédiaire",
  b2: "B2 — Intermédiaire avancé",
  c1: "C1 — Avancé",
  c2: "C2 — Maîtrise",
};

export const MANUAL_CATEGORY_LABELS: Record<ManualCategory, string> = {
  pronunciation: "Prononciation",
  alphabet: "Alphabet",
  accent: "Accent tonique",
  declensions: "Déclinaisons",
  prepositions: "Prépositions",
  verbs: "Verbes",
  aspect: "Aspect",
  "motion-verbs": "Verbes de mouvement",
  pronouns: "Pronoms",
  adjectives: "Adjectifs",
  numerals: "Numéraux",
  syntax: "Syntaxe",
  expressions: "Expressions",
  communication: "Communication",
  register: "Registre et style",
  culture: "Culture linguistique",
};

/** Target number of lessons per track (Manuel V1 roadmap). */
export const MANUAL_CURRICULUM_TARGETS: Record<ManualCategory, number> = {
  pronunciation: 15,
  alphabet: 10,
  accent: 10,
  declensions: 35,
  prepositions: 30,
  verbs: 45,
  aspect: 15,
  "motion-verbs": 20,
  pronouns: 20,
  adjectives: 15,
  numerals: 15,
  syntax: 40,
  expressions: 40,
  communication: 40,
  register: 30,
  culture: 20,
};

export const MANUAL_CURRICULUM_TOTAL = Object.values(MANUAL_CURRICULUM_TARGETS).reduce(
  (sum, count) => sum + count,
  0,
);

/** Editorial version — see docs/MANUAL_EDITORIAL_RULES.md */
export const MANUAL_EDITORIAL_VERSION = "v4";

/** Encadré delimiter used in lesson bodies. */
export const MANUAL_BOX_DELIMITER = "────────────────────────";

/** Mandatory boxed sections (V4). Titles may include leading emoji — see normalizeBoxTitle. */
export const MANUAL_REQUIRED_BOXES = [
  "Pourquoi ?",
  "Erreur fréquente",
  "À retenir",
] as const;

/** Recommended optional boxes (V4) — not enforced by validateLessonSections. */
export const MANUAL_RECOMMENDED_BOXES = [
  "💡 Astuce",
  "⚠ Attention",
  "⭐ Très fréquent",
  "Situation :",
  "Pour aller un peu plus loin",
] as const;

/** @deprecated Use MANUAL_REQUIRED_BOXES — kept for transitional imports. */
export const MANUAL_REQUIRED_SECTIONS = MANUAL_REQUIRED_BOXES;

export const MANUAL_CONTENT_ROOT = "content/manual";

/** Editorial anti-patterns — abstract labels without explanation. */
export const MANUAL_FORBIDDEN_PATTERNS: RegExp[] = [
  /\ble (génitif|accusatif|datif|instrumental|prépositionnel|nominatif) exprime\b/i,
  /\bla (déclinaison|terminaison) indique\b/i,
  /\bil convient de noter que\b/i,
  /\bdans le cadre de\b/i,
  /\bpar définition\b/i,
];

/** Storytelling / blog-style openings discouraged in V3. */
export const MANUAL_STORYTELLING_PATTERNS: RegExp[] = [
  /\btu ouvres\b/i,
  /\bton cerveau\b/i,
  /\bpremier cours de russe\b/i,
  /\binstagram\b/i,
  /\bnetflix\b/i,
  /^##\s+\d+\.\s/m,
];
