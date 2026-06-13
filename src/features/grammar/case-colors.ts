import { getCaseStyle } from "./case-styles";

/** @deprecated Use getCaseStyle for ending badges. */
export function getCaseUnderlineClass(grammaticalCase?: string | null): string {
  const style = getCaseStyle(grammaticalCase);
  if (!style) {
    return "decoration-neutral-400";
  }
  return style.endingBorder.replace("border-", "decoration-");
}

export { getCaseStyle, formatCaseLabelFr, normalizeCaseKey } from "./case-styles";
export { CASE_LEGEND_ENTRIES, getCaseLegendEntry } from "./case-legend-data";
export type { CaseKey, CaseStyle } from "./case-styles";
export type { CaseLegendEntry } from "./case-legend-data";
