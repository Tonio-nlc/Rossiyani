import { redirect } from "next/navigation";

import { labelsEquivalent } from "@/features/explorer/entity";

export function redirectIfCanonicalMismatch(
  requested: string,
  canonical: string,
  canonicalPath: string,
): void {
  if (!labelsEquivalent(requested, canonical)) {
    redirect(canonicalPath);
  }
}
