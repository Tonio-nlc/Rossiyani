import type { PartOfSpeech } from "@/types";

/** Tailwind classes for part-of-speech word color — dark theme. */
export const POS_TEXT_CLASSES: Record<PartOfSpeech, string> = {
  noun: "text-blue-400",
  verb: "text-red-400",
  adjective: "text-green-400",
  pronoun: "text-orange-400",
  adverb: "text-purple-400",
  numeral: "text-teal-400",
  preposition: "text-zinc-400",
  conjunction: "text-zinc-400",
  particle: "text-zinc-400",
  interjection: "text-pink-400",
};

export function getPosTextClass(partOfSpeech: PartOfSpeech): string {
  return POS_TEXT_CLASSES[partOfSpeech];
}
