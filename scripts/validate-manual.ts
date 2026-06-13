#!/usr/bin/env tsx
/**
 * Valide toutes les leçons du Manuel (structure + lint éditorial V4).
 * Référence : docs/MANUAL_EDITORIAL_RULES.md
 * Usage : npm run manual:validate
 */
import { loadAllLessons, getManualStats, MANUAL_EDITORIAL_VERSION } from "../src/features/manual";

try {
  const lessons = loadAllLessons();
  const stats = getManualStats();

  console.log(`✓ ${lessons.length} leçon(s) valide(s) (${MANUAL_EDITORIAL_VERSION})`);
  console.log(`  A1: ${stats.byLevel.a1} · Déclinaisons: ${stats.byCategory.declensions}`);

  for (const lesson of lessons) {
    console.log(`  · ${lesson.slug} (${lesson.category})`);
  }

  process.exit(0);
} catch (error) {
  console.error("✗ Validation échouée :");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
