export const SECTIONS = [
  { id: "pourquoi", label: "Pourquoi" },
  { id: "remarquer", label: "Remarquer" },
  { id: "patterns", label: "Idées russes" },
  { id: "exemples", label: "Exemples" },
  { id: "famille", label: "Famille" },
  { id: "variantes", label: "Variantes" },
  { id: "details", label: "Détails" },
] as const;

export type VocabularyFicheSectionId = (typeof SECTIONS)[number]["id"];
