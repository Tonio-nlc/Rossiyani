import { listLessonSummaries } from "@/features/manual";
import type { GraphConceptSummary } from "@/types/knowledge-graph";
import type { LemmaLessonRef } from "@/types/knowledge-graph";

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

export function findLemmaRelatedLessons(
  lemma: string,
  concepts: GraphConceptSummary[],
): LemmaLessonRef[] {
  const lessons = listLessonSummaries();
  const lemmaNeedle = normalize(lemma);
  const conceptNeedles = new Set(
    concepts.flatMap((concept) => [normalize(concept.title), normalize(concept.conceptKey)]),
  );

  const matches = lessons.filter((lesson) => {
    const title = normalize(lesson.title);
    if (title.includes(lemmaNeedle)) {
      return true;
    }

    return lesson.keywords.some((keyword) => {
      const normalizedKeyword = normalize(keyword);
      if (normalizedKeyword === lemmaNeedle || lemmaNeedle.includes(normalizedKeyword)) {
        return true;
      }
      return [...conceptNeedles].some(
        (needle) =>
          needle.includes(normalizedKeyword) ||
          normalizedKeyword.includes(needle) ||
          title.includes(normalizedKeyword),
      );
    });
  });

  return matches.slice(0, 6).map((lesson) => ({
    title: lesson.title,
    slug: lesson.slug,
    level: lesson.level.toUpperCase(),
  }));
}
