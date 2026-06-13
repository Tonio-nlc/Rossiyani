import { z } from "zod";

import { MANUAL_CATEGORIES, MANUAL_LEVELS } from "./constants";

export const ManualLessonFrontmatterSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  level: z.enum(MANUAL_LEVELS),
  category: z.enum(MANUAL_CATEGORIES),
  difficulty: z.coerce.number().int().min(1).max(5).default(1),
  estimatedReadingTime: z.coerce.number().int().min(1).max(120),
  prerequisites: z.array(z.string()).default([]),
  relatedLessons: z.array(z.string()).default([]),
  keywords: z.array(z.string()).default([]),
});
