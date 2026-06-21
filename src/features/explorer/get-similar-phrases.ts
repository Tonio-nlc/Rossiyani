import type { PhraseGroupType } from "@prisma/client";

import { phraseLookupKey } from "@/lib/normalization/russian-key";
import { prisma } from "@/lib/prisma";
import { collocationPath, expressionPath } from "@/components/explorer/explorer-routes";

export async function getSimilarPhrases(
  label: string,
  type: PhraseGroupType,
  limit = 6,
): Promise<Array<{ label: string; href: string }>> {
  const types: PhraseGroupType[] =
    type === "COLLOCATION" ? ["COLLOCATION"] : ["FIXED_EXPRESSION", "NATIVE_CONSTRUCTION"];

  const rows = await prisma.knowledgePhrase.findMany({
    where: {
      type: { in: types },
      NOT: { labelKey: phraseLookupKey(label) },
    },
    orderBy: { occurrenceCount: "desc" },
    take: limit,
    select: { label: true, type: true },
  });

  return rows.map((row) => ({
    label: row.label,
    href:
      row.type === "COLLOCATION"
        ? collocationPath(row.label)
        : expressionPath(row.label),
  }));
}
