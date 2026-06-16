"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Reference } from "@/components/editorial";
import { contextTranslationPath } from "@/lib/practice/constants";
import {
  deleteContextTranslationLesson,
  getSavedContextTranslationLessons,
} from "@/lib/context-translation/saved-lessons";

export function LibraryContextTranslationLessons() {
  const [lessons, setLessons] = useState(() => getSavedContextTranslationLessons());

  useEffect(() => {
    setLessons(getSavedContextTranslationLessons());
  }, []);

  const refresh = useCallback(() => {
    setLessons(getSavedContextTranslationLessons());
  }, []);

  const sortedLessons = useMemo(
    () => [...lessons].sort((a, b) => b.savedAt.localeCompare(a.savedAt)),
    [lessons],
  );

  if (sortedLessons.length === 0) {
    return (
      <p className="text-sm text-[var(--ink-muted)]">
        Saved context translation lessons will appear here.{" "}
        <Reference href="/practice/context-translation">Start a lesson →</Reference>
      </p>
    );
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {sortedLessons.map((lesson) => (
        <li key={lesson.id}>
          <article className="flex h-full flex-col border border-[var(--hairline)] px-5 py-4">
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--ink-muted)]">
              Context Translation
            </p>
            <p className="mt-3 line-clamp-2 text-sm text-[var(--ink-secondary)]">
              {lesson.originalSentence}
            </p>
            <p className="mt-2 break-russian font-reader text-lg leading-snug text-[var(--ink)]">
              {lesson.bestTranslation}
            </p>
            <p className="mt-3 text-xs text-[var(--ink-muted)]">
              {new Date(lesson.savedAt).toLocaleDateString(undefined, {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
              {lesson.grammarConcepts.length > 0
                ? ` · ${lesson.grammarConcepts.length} concepts`
                : ""}
            </p>
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-1 text-sm">
              <Link
                href={contextTranslationPath(lesson.id)}
                className="focus-kb text-[var(--ink-secondary)] hover:text-[var(--ink)]"
              >
                Open lesson
              </Link>
              <button
                type="button"
                onClick={() => {
                  deleteContextTranslationLesson(lesson.id);
                  refresh();
                }}
                className="focus-kb text-[var(--ink-muted)] hover:text-[var(--ink)]"
              >
                Remove
              </button>
            </div>
          </article>
        </li>
      ))}
    </ul>
  );
}
