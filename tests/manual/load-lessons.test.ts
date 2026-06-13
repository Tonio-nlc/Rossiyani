import { afterEach, describe, expect, it } from "vitest";

import {
  clearManualLessonCache,
  getLessonBySlug,
  getLessonsByLevel,
  getManualStats,
  loadAllLessons,
  MANUAL_CURRICULUM_TARGETS,
  MANUAL_CURRICULUM_TOTAL,
  validateLessonSections,
} from "@/features/manual";

describe("manual content loader", () => {
  afterEach(() => {
    clearManualLessonCache();
  });

  it("loads all lessons from content/manual", () => {
    const lessons = loadAllLessons();
    expect(lessons.length).toBeGreaterThanOrEqual(400);
  });

  it("validates required sections for each lesson", () => {
    for (const lesson of loadAllLessons()) {
      const validation = validateLessonSections(lesson.content);
      expect(validation.valid, lesson.slug).toBe(true);
    }
  });

  it("resolves lesson by slug", () => {
    const lesson = getLessonBySlug("alphabet-cyrillique");
    expect(lesson?.title).toBe("L'alphabet cyrillique");
    expect(lesson?.level).toBe("a1");
  });

  it("filters lessons by level", () => {
    const a1 = getLessonsByLevel("a1");
    expect(a1.every((lesson) => lesson.level === "a1")).toBe(true);
    expect(a1.length).toBeGreaterThanOrEqual(140);
  });

  it("includes A2, B1, B2, C1 and C2 lessons", () => {
    expect(getLessonsByLevel("a2").length).toBeGreaterThanOrEqual(174);
    expect(getLessonsByLevel("b1").length).toBeGreaterThanOrEqual(60);
    expect(getLessonsByLevel("b2").length).toBeGreaterThanOrEqual(17);
    expect(getLessonsByLevel("c1").length).toBeGreaterThanOrEqual(6);
    expect(getLessonsByLevel("c2").length).toBeGreaterThanOrEqual(4);
  });

  it("reports stats", () => {
    const stats = getManualStats();
    expect(stats.totalLessons).toBeGreaterThanOrEqual(400);
    expect(stats.byLevel.a1).toBeGreaterThanOrEqual(140);
    expect(stats.byLevel.a2).toBeGreaterThanOrEqual(174);
    expect(stats.byLevel.b1).toBeGreaterThanOrEqual(60);
    expect(stats.byLevel.b2).toBeGreaterThanOrEqual(17);
    expect(stats.byLevel.c1).toBeGreaterThanOrEqual(6);
    expect(stats.byLevel.c2).toBeGreaterThanOrEqual(4);
  });
});

describe("validateLessonSections", () => {
  it("rejects incomplete lesson bodies", () => {
    const result = validateLessonSections("## Question\n\nTexte sans encadré.");
    expect(result.valid).toBe(false);
    expect(result.missing.length).toBeGreaterThan(0);
  });
});

describe("manual batch size", () => {
  it("loads at least 400 published lessons", () => {
    expect(loadAllLessons().length).toBeGreaterThanOrEqual(400);
  });
});

describe("manual curriculum", () => {
  it("tracks 400 target lessons across 16 categories", () => {
    expect(Object.keys(MANUAL_CURRICULUM_TARGETS)).toHaveLength(16);
    expect(MANUAL_CURRICULUM_TOTAL).toBe(400);
  });
});
