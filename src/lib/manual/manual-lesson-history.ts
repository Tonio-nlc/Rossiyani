const STORAGE_KEY = "rossiyani:manualLessonHistory";

export type ManualLessonVisit = {
  slug: string;
  title?: string;
  visitedAt: string;
};

function isBrowser(): boolean {
  return typeof localStorage !== "undefined";
}

function loadVisits(): ManualLessonVisit[] {
  if (!isBrowser()) {
    return [];
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as ManualLessonVisit[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveVisits(visits: ManualLessonVisit[]): void {
  if (!isBrowser()) {
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(visits.slice(0, 40)));
}

/** Records a lesson page visit (most recent first). */
export function recordManualLessonVisit(slug: string, title?: string): void {
  if (!isBrowser() || slug.trim().length === 0) {
    return;
  }

  const now = new Date().toISOString();
  const visits = loadVisits().filter((visit) => visit.slug !== slug);
  visits.unshift({ slug, title, visitedAt: now });
  saveVisits(visits);
}

export function getRecentManualLessonVisits(limit = 5): ManualLessonVisit[] {
  return loadVisits()
    .sort((left, right) => new Date(right.visitedAt).getTime() - new Date(left.visitedAt).getTime())
    .slice(0, limit);
}

export function getRecentManualLessonSlugs(limit = 5): string[] {
  return loadVisits()
    .sort((left, right) => new Date(right.visitedAt).getTime() - new Date(left.visitedAt).getTime())
    .slice(0, limit)
    .map((visit) => visit.slug);
}

export function getManualLessonVisitCount(): number {
  const slugs = new Set(loadVisits().map((visit) => visit.slug));
  return slugs.size;
}
