import type { ManualCategory, ManualLevel } from "./constants";

export type ManualLessonFrontmatter = {
  title: string;
  slug: string;
  level: ManualLevel;
  category: ManualCategory;
  difficulty: number;
  estimatedReadingTime: number;
  prerequisites: string[];
  relatedLessons: string[];
  keywords: string[];
};

export type ManualLessonMeta = ManualLessonFrontmatter & {
  filePath: string;
  sectionCount: number;
};

export type ManualLesson = ManualLessonMeta & {
  content: string;
};

export type ManualLessonSummary = Pick<
  ManualLessonMeta,
  | "title"
  | "slug"
  | "level"
  | "category"
  | "difficulty"
  | "estimatedReadingTime"
  | "keywords"
>;
