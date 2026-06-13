import { formLookupKey } from "@/lib/normalization/russian-key";

import { findClosestKnownForm } from "./levenshtein";
import { isInternalLexiconWord } from "./internal-dictionary";
import { normalizeTokenSurface } from "./tokenize-russian";
import type { TokenQualityEntry, TokenQualityStatus } from "./types";

export type ClassifyTokenContext = {
  knownFormKeys: Set<string>;
  knownLemmaKeys: Set<string>;
  knownFormSurfaces: string[];
  frequency: number;
};

const CYRILLIC_PATTERN = /[\p{Script=Cyrillic}]/u;
const LATIN_ONLY = /^[a-zA-Z]+$/;
const IMPROBABLE_REPEAT = /(.)\1{3,}/u;
const IMPROBABLE_CONSONANT_RUN = /[бвгджзклмнпрстфхцчшщ]{6,}/iu;

export function scoreToken(
  surface: string,
  ctx: Omit<ClassifyTokenContext, "frequency">,
): { confidence: number; reasons: string[] } {
  const normalized = normalizeTokenSurface(surface);
  const reasons: string[] = [];
  let confidence = 0;

  if (!CYRILLIC_PATTERN.test(surface)) {
    reasons.push("Aucun caractère cyrillique");
    return { confidence: -100, reasons };
  }
  confidence += 30;
  reasons.push("Contient du cyrillique");

  if (LATIN_ONLY.test(surface)) {
    confidence -= 50;
    reasons.push("Caractères latins incohérents");
  }

  if (surface.length >= 2 && surface.length <= 24) {
    confidence += 20;
    reasons.push("Longueur raisonnable");
  } else if (surface.length > 24) {
    confidence -= 30;
    reasons.push("Longueur inhabituelle");
  } else {
    confidence -= 10;
    reasons.push("Token trop court");
  }

  const formKey = formLookupKey(surface);
  if (ctx.knownFormKeys.has(formKey)) {
    confidence += 35;
    reasons.push("Forme connue dans la bibliothèque");
  }

  if (ctx.knownLemmaKeys.has(normalized)) {
    confidence += 15;
    reasons.push("Lemme connu");
  }

  if (isInternalLexiconWord(normalized)) {
    confidence += 15;
    reasons.push("Présent dans le dictionnaire interne");
  }

  if (IMPROBABLE_REPEAT.test(surface)) {
    confidence -= 25;
    reasons.push("Répétitions improbables");
  }

  if (IMPROBABLE_CONSONANT_RUN.test(surface)) {
    confidence -= 20;
    reasons.push("Enchaînement de consonnes improbable");
  }

  if (!ctx.knownFormKeys.has(formKey) && !isInternalLexiconWord(normalized)) {
    confidence -= 10;
    reasons.push("Aucune occurrence connue");
  }

  if (
    normalized.length > 12 &&
    !ctx.knownFormKeys.has(formKey) &&
    !ctx.knownLemmaKeys.has(normalized) &&
    !isInternalLexiconWord(normalized)
  ) {
    confidence -= 20;
    reasons.push("Forme longue sans correspondance connue");
  }

  return { confidence, reasons };
}

export function classifyTokenStatus(
  confidence: number,
  inKnownForm: boolean,
  inKnownLemma = false,
  inInternalLexicon = false,
): TokenQualityStatus {
  if (confidence < 10) {
    return "INVALID";
  }
  if (inKnownForm || inKnownLemma || inInternalLexicon || confidence >= 75) {
    return "KNOWN";
  }
  if (confidence >= 35) {
    return "UNKNOWN";
  }
  return "SUSPICIOUS";
}

export function classifyToken(
  surface: string,
  ctx: ClassifyTokenContext,
): TokenQualityEntry {
  const normalized = normalizeTokenSurface(surface);
  const formKey = formLookupKey(surface);
  const inKnownForm = ctx.knownFormKeys.has(formKey);
  const inKnownLemma = ctx.knownLemmaKeys.has(normalized);
  const inInternalLexicon = isInternalLexiconWord(normalized);
  const { confidence, reasons } = scoreToken(surface, ctx);
  const status = classifyTokenStatus(
    confidence,
    inKnownForm,
    inKnownLemma,
    inInternalLexicon,
  );

  let suggestion: string | null = null;
  if (status === "SUSPICIOUS" && ctx.knownFormSurfaces.length > 0) {
    suggestion = findClosestKnownForm(surface, ctx.knownFormSurfaces);
    if (suggestion && normalizeTokenSurface(suggestion) === normalized) {
      suggestion = null;
    }
  }

  const entryReasons = [...reasons];
  if (status === "SUSPICIOUS") {
    entryReasons.push("Aucune correspondance fiable");
    if (ctx.frequency === 1) {
      entryReasons.push("Fréquence 1");
    }
  }

  return {
    surface,
    normalized,
    status,
    confidence,
    reasons: entryReasons,
    suggestion,
    frequency: ctx.frequency,
  };
}

export function isSuspiciousWordExplanation(explanation: string): boolean {
  return explanation.includes("[rossiyani:suspicious]");
}

export function classifyTokenHeuristic(surface: string): TokenQualityStatus {
  const { confidence, reasons } = scoreToken(surface, {
    knownFormKeys: new Set(),
    knownLemmaKeys: new Set(),
    knownFormSurfaces: [],
  });
  if (reasons.includes("Aucun caractère cyrillique")) {
    return "INVALID";
  }
  return classifyTokenStatus(confidence, false);
}

export function isReaderSuspiciousWord(
  original: string,
  explanation: string,
  formId: string | null,
): boolean {
  if (isSuspiciousWordExplanation(explanation)) {
    return true;
  }
  if (formId) {
    return false;
  }
  const status = classifyTokenHeuristic(original);
  return status === "SUSPICIOUS" || status === "INVALID";
}
