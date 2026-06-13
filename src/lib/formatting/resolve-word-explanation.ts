import { resolveWordSemanticData } from "@/lib/formatting/resolve-word-semantic-data";

import { WORD_EXPLANATION_EMPTY } from "./word-explanation-guard";

export { WORD_EXPLANATION_EMPTY };

/**
 * @internal UI should prefer resolveWordSemanticData().
 */
export function resolveCompactWordExplanation(
  detail: Parameters<typeof resolveWordSemanticData>[0],
): string {
  return resolveWordSemanticData(detail).explanation;
}
