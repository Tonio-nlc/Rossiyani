import {
  validateLexicalTranslation,
} from "@/lib/formatting/lexical-validation";
import type { WordDetailGraph } from "@/types/word-detail-graph";

/** Local lemma/form → French glosses — no AI, no network. */
export const LOCAL_DICTIONARY_GLOSS: Record<string, string> = {
  расцветать: "fleurir",
  расцветали: "fleurir",
  расцветала: "fleurir",
  яблоня: "pommier",
  яблони: "pommier",
  яблоню: "pommier",
  груша: "poire",
  груши: "poire",
  груш: "poire",
  морозный: "glacial",
  морозная: "glaciale",
  морозной: "glacial",
  морозные: "glaciales",
  дерево: "arbre",
  деревья: "arbres",
  деревьях: "arbres",
  дереве: "arbre",
  начинать: "commencer",
  начинает: "commence",
  начинаем: "commencer",
  иной: "autre",
  иного: "autre",
  городок: "petite ville",
  городке: "petite ville",
  за: "après / derrière",
  будни: "jours ouvrables",
  обычный: "habituel / ordinaire",
  обычные: "habituel / ordinaire",
  дым: "fumée",
  дыма: "fumée",
  даже: "même",
  правильно: "correctement",
  получится: "réussir",
  получиться: "réussir",
  больной: "malade",
  больных: "malade",
  больная: "malade",
  больное: "malade",
  у: "chez / de",
  в: "dans / en",
  на: "sur / à",
  с: "avec / de",
  к: "vers / chez",
  о: "sur / à propos de",
  и: "et",
  но: "mais",
  а: "mais / et",
  или: "ou",
  что: "que",
  как: "comme",
  когда: "quand",
  если: "si",
  он: "il",
  она: "elle",
  они: "ils",
  мы: "nous",
  вы: "vous",
  я: "je",
  ты: "tu",
  это: "c'est / ce",
  быть: "être",
  есть: "il y a",
  зима: "hiver",
  лето: "été",
  весна: "printemps",
  осень: "automne",
  дом: "maison",
  вода: "eau",
  день: "jour",
  ночь: "nuit",
  человек: "personne",
  время: "temps",
  жизнь: "vie",
  мир: "monde / paix",
  большой: "grand",
  маленький: "petit",
  новый: "nouveau",
  старый: "vieux",
  хороший: "bon",
  русский: "russe",
  привет: "salut",
};

function normalizeRuKey(text: string): string {
  return text.trim().toLowerCase().replace(/ё/g, "е");
}

function lookupEstimatedGloss(key: string): string | null {
  const normalized = normalizeRuKey(key);
  return ESTIMATED_GLOSS[normalized] ?? null;
}

const ESTIMATED_GLOSS = LOCAL_DICTIONARY_GLOSS;

export { lookupEstimatedGloss };

function acceptEstimated(candidate: string | null | undefined): string | null {
  if (!candidate?.trim()) {
    return null;
  }
  const validation = validateLexicalTranslation(candidate);
  return validation.accepted ? candidate.trim() : null;
}

/**
 * Local dictionary lookup — returns null when nothing valid exists.
 */
export function estimateWordTranslation(detail: WordDetailGraph): string | null {
  const { original, lemma } = detail.occurrence;

  for (const key of [original, lemma]) {
    const hit = acceptEstimated(lookupEstimatedGloss(key));
    if (hit) {
      return hit;
    }
  }

  return null;
}
