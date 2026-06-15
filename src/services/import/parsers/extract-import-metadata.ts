import type { CefrLevel } from "@/types/domain";
import { segmentSentences } from "@/services/parser/segment-sentences";
import { cleanText } from "@/services/parser/clean-text";

import type { ImportDocumentMetadata, NormalizeImportOptions } from "./types";
import { mergeBrokenLines } from "./merge-broken-lines";
import { normalizeQuotes } from "./normalize-quotes";
import { removeInlinePdfArtifacts, removePdfArtifacts } from "./remove-pdf-artifacts";
import { splitLongParagraphs } from "./split-long-paragraphs";

const INVISIBLE = /[\u200B-\u200D\uFEFF\u00AD\u2060\u180E]/g;

function stripInvisibleCharacters(text: string): string {
  return text.replace(INVISIBLE, "");
}

function normalizeUnicode(text: string): string {
  return text.normalize("NFC");
}

function titleFromFileName(fileName: string): string {
  return fileName.replace(/\.(txt|md|pdf)$/i, "").replace(/[-_]/g, " ").trim();
}

function titleFromText(text: string): string | null {
  const firstParagraph = text.split(/\n\n+/).find((p) => p.trim().length > 0)?.trim() ?? "";
  const firstLine = firstParagraph.split("\n")[0]?.trim() ?? "";

  if (firstLine.length >= 4 && firstLine.length <= 80 && !/[.!?…]/.test(firstLine.slice(-1))) {
    return firstLine;
  }

  const firstSentence = segmentSentences(text)[0]?.trim() ?? "";
  if (firstSentence.length >= 4 && firstSentence.length <= 80) {
    return firstSentence.replace(/[.!?…]+$/, "").trim();
  }

  return null;
}

const CEFR_LEVELS: CefrLevel[] = ["A1", "A2", "B1", "B2", "C1", "Native"];

function detectLevelFromFileName(fileName: string): CefrLevel | null {
  for (const level of CEFR_LEVELS) {
    const re = new RegExp(`(^|[^A-Za-z])${level}($|[^A-Za-z])`, "i");
    if (re.test(fileName)) {
      return level;
    }
  }
  return null;
}

function detectLevelFromText(text: string): CefrLevel | null {
  const sentences = segmentSentences(text);
  if (sentences.length === 0) {
    return null;
  }

  const words = text.match(/[\p{L}']+/gu) ?? [];
  if (words.length === 0) {
    return null;
  }

  const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
  const avgSentenceWords =
    sentences.reduce((sum, sentence) => sum + (sentence.match(/[\p{L}']+/gu)?.length ?? 0), 0) /
    sentences.length;

  if (avgSentenceWords <= 7 && avgWordLength <= 5.2) {
    return "A1";
  }
  if (avgSentenceWords <= 11 && avgWordLength <= 5.8) {
    return "A2";
  }
  if (avgSentenceWords <= 16 && avgWordLength <= 6.4) {
    return "B1";
  }
  if (avgSentenceWords <= 22) {
    return "B2";
  }
  if (avgSentenceWords <= 28) {
    return "C1";
  }
  return "Native";
}

function detectCategory(text: string): string | null {
  const lines = text.split("\n");
  const dialogueLines = lines.filter((line) => /^[\s—–-]/.test(line) || /^[А-ЯA-Z][^:]{0,40}:/.test(line));
  if (dialogueLines.length >= 3 && dialogueLines.length / lines.length > 0.25) {
    return "Dialogue";
  }

  if (/^(?:\d+[.)]|[-•*])\s+/m.test(text)) {
    return "Liste / exercice";
  }

  if (/(?:урок|lesson|exercise|exercice|grammar|grammaire)/i.test(text)) {
    return "Leçon";
  }

  const paragraphs = text.split(/\n\n+/);
  if (paragraphs.length >= 4 && text.length > 1200) {
    return "Article";
  }

  if (lines.length > 12 && paragraphs.length <= 2 && text.length < 800) {
    return "Poésie / chanson";
  }

  return "Texte";
}

function buildSummary(text: string, title: string): string {
  const firstParagraph =
    text.split(/\n\n+/).find((p) => p.trim().length > 40)?.trim() ??
    segmentSentences(text)[0]?.trim() ??
    "";

  if (!firstParagraph) {
    return `Texte russe — ${title}.`;
  }

  const summary = firstParagraph.replace(/\s+/g, " ").trim();
  return summary.length > 220 ? `${summary.slice(0, 217).trim()}…` : summary;
}

function buildFocusPoints(text: string, category: string | null): string[] {
  const points: string[] = [];
  const seen = new Set<string>();

  const add = (point: string) => {
    const key = point.toLowerCase();
    if (!key || seen.has(key) || points.length >= 4) {
      return;
    }
    seen.add(key);
    points.push(point);
  };

  if (category === "Dialogue") {
    add("Dialogues et répliques");
  }
  if (category === "Liste / exercice") {
    add("Listes et structures répétitives");
  }
  if (category === "Leçon") {
    add("Vocabulaire pédagogique");
  }
  if (/[«»"]/.test(text)) {
    add("Citations et guillemets");
  }
  if (/(?:—|–)/.test(text)) {
    add("Tirets cadratins");
  }
  if (points.length === 0) {
    add("Compréhension générale");
  }

  return points;
}

export function extractImportMetadata(
  text: string,
  options: { fileName?: string; level?: CefrLevel },
): ImportDocumentMetadata {
  const estimatedSentences = segmentSentences(text).length;
  const detectedFromFile = options.fileName ? detectLevelFromFileName(options.fileName) : null;
  const detectedLevel = detectedFromFile ?? detectLevelFromText(text);
  const category = detectCategory(text);
  const title =
    (options.fileName ? titleFromFileName(options.fileName) : null) ??
    titleFromText(text) ??
    "Nouveau texte";

  return {
    summary: buildSummary(text, title),
    focusPoints: buildFocusPoints(text, category),
    category,
    estimatedReadingMinutes: Math.max(1, Math.ceil(estimatedSentences * 0.45)),
    detectedLevel,
    estimatedSentences,
  };
}

/**
 * Shared normalization pipeline for all import sources.
 */
export function normalizeImportDocument(
  raw: string,
  options: NormalizeImportOptions,
): { text: string; metadata: ImportDocumentMetadata } {
  let text = normalizeUnicode(raw);
  text = stripInvisibleCharacters(text);
  text = cleanText(text);
  text = normalizeQuotes(text);

  if (options.sourceType === "pdf") {
    if (options.pdfPages && options.pdfPages.length > 0) {
      text = removePdfArtifacts(options.pdfPages);
    } else {
      text = removeInlinePdfArtifacts(text);
    }
    text = mergeBrokenLines(text);
  } else {
    text = mergeBrokenLines(text);
  }

  text = splitLongParagraphs(text);
  text = cleanText(text);

  const metadata = extractImportMetadata(text, { fileName: options.fileName });

  return { text, metadata };
}

/** @deprecated Use normalizeImportDocument — kept for architecture naming. */
export const normalize = normalizeImportDocument;
