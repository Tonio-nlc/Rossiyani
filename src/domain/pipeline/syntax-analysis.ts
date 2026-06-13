/** Syntax dependency node for a word token. */
export type SyntaxTokenNode = {
  position: number;
  original: string;
  lemma: string;
  partOfSpeech: import("@/types/domain").PartOfSpeech;
  /** Index of governing token, if any. */
  headPosition: number | null;
  /** Universal dependency relation label (e.g. nsubj, obj, obl). */
  relation: string | null;
};

/** Sentence-level syntax analysis produced at import. */
export type SyntaxAnalysis = {
  tokens: SyntaxTokenNode[];
  /** Free-text French explanation of word order / clause structure. */
  structureExplanation: string;
};
