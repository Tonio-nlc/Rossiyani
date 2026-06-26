/** Central route helpers for the Lessons section (formerly Manual). */

export const LESSONS_HOME = "/lessons" as const;

export function lessonPath(slug: string): string {
  return `/lessons/lecons/${slug}`;
}

export function lessonsLevelPath(level: string): string {
  return `/lessons/niveau/${level}`;
}

export function lessonsThemePath(category: string): string {
  return `/lessons/theme/${category}`;
}

export function lessonsCurriculumPath(caseId: string): string {
  return `/lessons/curriculum/${caseId}`;
}

export function lessonsCollectionPath(collectionId: string): string {
  return `/lessons/collections/${collectionId}`;
}

/** Rewrite legacy manual URLs in markdown and stored links. */
export function normalizeLessonsHref(href: string): string {
  if (href.startsWith("/manual/")) {
    return href.replace("/manual/", "/lessons/");
  }
  if (href === "/manual") {
    return LESSONS_HOME;
  }
  return href;
}
