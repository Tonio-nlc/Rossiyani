export type ExplorerHubLink = {
  label: string;
  href: string;
  description?: string;
};

export const EXPLORER_GRAMMAR_LINKS: ExplorerHubLink[] = [
  { label: "Cas", href: "/explorer/cases", description: "Nom, pronom, adjectif" },
  { label: "Prépositions", href: "/explorer?q=préposition", description: "Régimes et sens" },
  { label: "Aspect", href: "/explorer?q=aspect", description: "Perfectif / imperfectif" },
  { label: "Temps", href: "/explorer?q=temps", description: "Présent, passé, futur" },
  {
    label: "Verbes de mouvement",
    href: "/explorer?q=verbe de mouvement",
    description: "Идти, ехать, unidirectional…",
  },
  { label: "Pronoms", href: "/explorer?q=pronom", description: "Personnels, démonstratifs" },
];

export const EXPLORER_VOCABULARY_LINKS: ExplorerHubLink[] = [
  { label: "Lemmes", href: "/explorer/lemmas", description: "Entrées lexicales du graphe" },
  {
    label: "Formes",
    href: "/explorer/lemmas",
    description: "Paradigmes fléchis via les lemmes",
  },
  { label: "Collocations", href: "/explorer/collocations", description: "Cooccurrences fréquentes" },
];

export const SEARCH_TYPE_HINTS = [
  "lemmes",
  "formes",
  "terminaisons",
  "concepts",
  "collocations",
  "textes",
] as const;
