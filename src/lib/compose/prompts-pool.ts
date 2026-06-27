export const COMPOSE_TRANSLATION_PROMPTS = [
  "Je voudrais un café, s'il vous plaît.",
  "Il fait beau aujourd'hui.",
  "Je ne comprends pas cette phrase.",
  "Où est la gare la plus proche ?",
  "J'ai appris le russe pendant deux ans.",
  "Pouvez-vous répéter plus lentement ?",
  "Ce livre m'a beaucoup plu.",
  "Nous partons demain matin.",
] as const;

export function pickTranslationPrompt(seed?: string): string {
  if (seed?.trim()) {
    return seed.trim();
  }
  const index = Math.floor(Math.random() * COMPOSE_TRANSLATION_PROMPTS.length);
  return COMPOSE_TRANSLATION_PROMPTS[index]!;
}

export const COMPOSE_REFORMULATION_REFERENCES = [
  "Мне нравится читать по вечерам.",
  "Сегодня на улице очень холодно.",
  "Я давно хотел посетить этот музей.",
  "Она говорит по-русски очень хорошо.",
] as const;

export function pickReformulationReference(seed?: string): string {
  if (seed?.trim()) {
    return seed.trim();
  }
  const index = Math.floor(Math.random() * COMPOSE_REFORMULATION_REFERENCES.length);
  return COMPOSE_REFORMULATION_REFERENCES[index]!;
}
