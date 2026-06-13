import matter from "gray-matter";

import { MANUAL_BOX_DELIMITER, MANUAL_REQUIRED_BOXES } from "./constants";
import { validateEditorialStyle } from "./editorial-lint";
import { ManualLessonFrontmatterSchema } from "./schema";
import type { ManualLesson, ManualLessonMeta } from "./types";

function normalizeBoxTitle(value: string): string {
  return value
    .trim()
    .replace(/^(\p{Emoji_Presentation}|\p{Extended_Pictographic})+\s*/u, "")
    .toLowerCase();
}

function isBoxDelimiterLine(line: string): boolean {
  const trimmed = line.trim();
  return trimmed.length > 0 && trimmed.replace(/─/g, "").length === 0;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function extractBoxTitles(content: string): string[] {
  const pattern = new RegExp(
    `${escapeRegex(MANUAL_BOX_DELIMITER)}\\s*\\n\\s*([^\\n]+?)\\s*\\n`,
    "g",
  );
  const titles: string[] = [];

  for (const match of content.matchAll(pattern)) {
    const title = match[1]?.trim();
    if (title && !isBoxDelimiterLine(title)) {
      titles.push(title);
    }
  }

  return titles;
}

export function extractPresentSections(content: string): string[] {
  const titles = new Set(extractBoxTitles(content).map(normalizeBoxTitle));

  return MANUAL_REQUIRED_BOXES.filter((box) => titles.has(normalizeBoxTitle(box)));
}

export function validateLessonSections(content: string): {
  valid: boolean;
  missing: string[];
  present: string[];
} {
  const titles = new Set(extractBoxTitles(content).map(normalizeBoxTitle));

  const present = MANUAL_REQUIRED_BOXES.filter((box) => titles.has(normalizeBoxTitle(box)));
  const missing: string[] = MANUAL_REQUIRED_BOXES.filter((box) => !titles.has(normalizeBoxTitle(box)));

  const delimiterCount = content.split(MANUAL_BOX_DELIMITER).length - 1;
  if (delimiterCount < MANUAL_REQUIRED_BOXES.length * 2) {
    missing.push(
      `(encadrés incomplets : ${delimiterCount} délimiteurs, minimum ${MANUAL_REQUIRED_BOXES.length * 2})`,
    );
  }

  return {
    valid: missing.length === 0,
    missing: [...missing],
    present,
  };
}

export function parseLessonFile(raw: string, filePath: string): ManualLesson {
  const { data, content } = matter(raw);
  const frontmatter = ManualLessonFrontmatterSchema.parse(data);

  if (frontmatter.slug !== frontmatter.slug.toLowerCase()) {
    throw new Error(`Invalid slug casing in ${filePath}: ${frontmatter.slug}`);
  }

  const boxes = validateLessonSections(content);
  if (!boxes.valid) {
    throw new Error(
      `Lesson "${frontmatter.slug}" (${filePath}) missing boxes: ${boxes.missing.join(", ")}`,
    );
  }

  const editorial = validateEditorialStyle(content);
  if (!editorial.valid) {
    throw new Error(
      `Lesson "${frontmatter.slug}" (${filePath}) editorial violations: ${editorial.violations.join("; ")}`,
    );
  }

  const meta: ManualLessonMeta = {
    ...frontmatter,
    filePath,
    sectionCount: boxes.present.length,
  };

  return {
    ...meta,
    content: content.trim(),
  };
}
