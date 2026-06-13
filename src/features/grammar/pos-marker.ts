import type { PartOfSpeech } from "@/types";

/** Subtle POS indicator — secondary to ending/case visuals. */
export const POS_MARKER_CLASSES: Record<PartOfSpeech, string> = {
  noun: "bg-blue-500",
  verb: "bg-red-500",
  adjective: "bg-green-500",
  pronoun: "bg-orange-500",
  adverb: "bg-purple-500",
  numeral: "bg-teal-500",
  preposition: "bg-neutral-400",
  conjunction: "bg-neutral-400",
  particle: "bg-neutral-400",
  interjection: "bg-pink-500",
};

export const POS_LABELS_FR: Record<PartOfSpeech, string> = {
  noun: "nom",
  verb: "verbe",
  adjective: "adjectif",
  pronoun: "pronom",
  adverb: "adverbe",
  numeral: "numéral",
  preposition: "préposition",
  conjunction: "conjonction",
  particle: "particule",
  interjection: "interjection",
};

export function getPosMarkerClass(partOfSpeech: PartOfSpeech): string {
  return POS_MARKER_CLASSES[partOfSpeech];
}
