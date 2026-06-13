/**
 * Rossiyani Design System v2 — programmatic tokens.
 * Source of truth: design/design-system.md
 */

export const colors = {
  paper: "#F6F4EF",
  surfacePrimary: "#FCFBF8",
  surfaceSecondary: "#F0ECE4",
  ink: "#1F1F1D",
  inkSecondary: "#66635F",
  inkMuted: "#8A867F",
  inkDisabled: "#B7B2AA",
  link: "#5F768D",
  grammar: "#74806F",
  culture: "#B39255",
  exception: "#8A4C43",
} as const;

export const layout = {
  contentMax: 1200,
  readingMax: 760,
  annotationMax: 320,
  sidebarWidth: 280,
  headerHeight: 56,
} as const;

export const spacing = {
  1: 8,
  2: 16,
  3: 24,
  4: 32,
  5: 48,
  6: 64,
  7: 96,
} as const;

export const radius = {
  sm: 6,
  md: 10,
  lg: 16,
  pill: 999,
} as const;

export type SemanticColor = "link" | "grammar" | "culture" | "exception";

export const semanticColorVar: Record<SemanticColor, string> = {
  link: "var(--color-link)",
  grammar: "var(--color-grammar)",
  culture: "var(--color-culture)",
  exception: "var(--color-exception)",
};
