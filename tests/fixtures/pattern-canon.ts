import { buildReaderGuideCopy } from "@/lib/patterns/build-reader-guide-copy";
import type { ReaderPatternCanon } from "@/types/reader-pattern-experience";
import type { LearningPattern } from "@/types/patterns";

/** Test fixture — attaches catalog-derived guide copy to a pattern canon stub. */
export function patternCanonFixture(
  partial: Pick<
    LearningPattern,
    "id" | "userFacingName" | "observation" | "insight" | "comprehension"
  >,
): ReaderPatternCanon {
  const stub = {
    ...partial,
    slug: partial.id,
    cognitiveSurprise: "",
  } as LearningPattern;

  return {
    ...partial,
    guide: buildReaderGuideCopy(stub),
  };
}
