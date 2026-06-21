export type ExplorerHubLink = {
  label: string;
  href: string;
  description?: string;
};

export const EXPLORER_CATEGORY_LINKS: ExplorerHubLink[] = [
  { label: "Lemmas", href: "/explorer/lemmas", description: "Individual words from your texts" },
  { label: "Concepts", href: "/explorer/concepts", description: "Grammar concepts" },
  { label: "Cases", href: "/explorer/cases", description: "The six Russian cases" },
  { label: "Endings", href: "/explorer/endings", description: "Recurring grammatical endings" },
  { label: "Collocations", href: "/explorer/collocations", description: "Frequent word combinations" },
  { label: "Expressions", href: "/explorer/expressions", description: "Idioms and fixed expressions" },
];
