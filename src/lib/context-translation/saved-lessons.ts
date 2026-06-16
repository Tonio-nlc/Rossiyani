import type { ContextTranslationAnalysis, SavedContextTranslationLesson } from "./types";

const STORAGE_KEY = "rossiyani:contextTranslationLessons";
const MAX_ENTRIES = 50;

function isBrowser(): boolean {
  return typeof localStorage !== "undefined";
}

function loadLessons(): SavedContextTranslationLesson[] {
  if (!isBrowser()) {
    return [];
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as SavedContextTranslationLesson[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistLessons(lessons: SavedContextTranslationLesson[]): void {
  if (!isBrowser()) {
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lessons.slice(0, MAX_ENTRIES)));
}

export function getSavedContextTranslationLessons(): SavedContextTranslationLesson[] {
  return loadLessons();
}

export function saveContextTranslationLesson(
  analysis: ContextTranslationAnalysis,
): SavedContextTranslationLesson {
  const entry: SavedContextTranslationLesson = {
    ...analysis.saveableLesson,
    id: crypto.randomUUID(),
    savedAt: new Date().toISOString(),
    analysis,
  };
  persistLessons([entry, ...loadLessons()]);
  return entry;
}

function migrateAnalysis(analysis: ContextTranslationAnalysis): ContextTranslationAnalysis {
  const legacy = analysis as ContextTranslationAnalysis & {
    nativeReasoning?: string;
    similarExpressions?: unknown[];
  };

  if (legacy.thinkLikeNative) {
    return analysis;
  }

  return {
    ...analysis,
    thinkLikeNative: {
      sourceLanguageLabel:
        analysis.sourceLanguage === "fr"
          ? "French"
          : analysis.sourceLanguage === "en"
            ? "English"
            : "Russian",
      sourceThought: analysis.sourceText,
      mentalImage: analysis.literalMeaning,
      nativeThought: analysis.literalMeaning,
      nativeFormulation: analysis.bestTranslation,
      conceptualShift: legacy.nativeReasoning ?? analysis.literalMeaning,
    },
    naturalness: analysis.naturalness ?? null,
    grammarConcepts: analysis.grammarConcepts ?? [],
  };
}

export function getContextTranslationLessonById(id: string): SavedContextTranslationLesson | null {
  const lesson = loadLessons().find((entry) => entry.id === id) ?? null;
  if (!lesson) {
    return null;
  }

  return {
    ...lesson,
    analysis: migrateAnalysis(lesson.analysis),
  };
}

export function deleteContextTranslationLesson(id: string): void {
  persistLessons(loadLessons().filter((lesson) => lesson.id !== id));
}
