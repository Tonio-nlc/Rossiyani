import type { ExplorerSidebarCategoryId } from "./explorer-sidebar-nav";

export type ExplorerCategoryMeta = {
  id: ExplorerSidebarCategoryId;
  label: string;
  href: string;
  /** One-sentence mission shown at the top of the category page. */
  mission: string;
  /** Shorter line on home category cards. */
  homeDescription: string;
  /** Illustrative samples on home cards — not live data. */
  examples: string[];
};

export const EXPLORER_EMPTY_MESSAGE =
  "Content will appear as you read and analyse texts.";

export const EXPLORER_DISCOVERY_FRAMING =
  "Discovery from what you have encountered — not structured lessons. For teaching, use the Manual.";

export const EXPLORER_CATEGORIES: ExplorerCategoryMeta[] = [
  {
    id: "lemmas",
    label: "Lemmas",
    href: "/explorer/lemmas",
    mission: "Words encountered in your reading and practice.",
    homeDescription: "Words encountered in your reading.",
    examples: ["она", "читать", "дом"],
  },
  {
    id: "concepts",
    label: "Concepts",
    href: "/explorer/concepts",
    mission: "Grammar ideas and patterns observed across texts.",
    homeDescription: "Grammar patterns observed.",
    examples: ["Aspect", "Motion", "Possession"],
  },
  {
    id: "cases",
    label: "Cases",
    href: "/explorer/cases",
    mission: "The six Russian cases explained through real examples.",
    homeDescription: "The six Russian cases.",
    examples: ["Nominative", "Genitive", "Accusative"],
  },
  {
    id: "endings",
    label: "Endings",
    href: "/explorer/endings",
    mission: "Recurring endings and their grammatical functions.",
    homeDescription: "Recurring endings and their roles.",
    examples: ["-а", "-ов", "-ом"],
  },
  {
    id: "collocations",
    label: "Collocations",
    href: "/explorer/collocations",
    mission: "Words that naturally appear together.",
    homeDescription: "Words that appear together.",
    examples: ["пить кофе", "идти домой", "очень хорошо"],
  },
  {
    id: "expressions",
    label: "Expressions",
    href: "/explorer/expressions",
    mission: "Fixed expressions and native turns of phrase.",
    homeDescription: "Fixed expressions and native phrases.",
    examples: ["как дела", "ни за что", "в общем"],
  },
];

export function getExplorerCategory(
  id: ExplorerSidebarCategoryId,
): ExplorerCategoryMeta {
  const category = EXPLORER_CATEGORIES.find((entry) => entry.id === id);
  if (!category) {
    throw new Error(`Unknown explorer category: ${id}`);
  }
  return category;
}

export function categoryPortalCards() {
  return EXPLORER_CATEGORIES.map((category) => ({
    kind: "portal" as const,
    portalKind: "category" as const,
    title: category.label,
    href: category.href,
    description: category.homeDescription,
    examples: category.examples,
  }));
}
