import { computeContentHash } from "@/lib/hash/content-hash";
import { prisma } from "@/lib/prisma";

export type DuplicateCheckResult = {
  contentHash: string;
  isDuplicate: boolean;
  existingTextId: string | null;
  existingTitle: string | null;
};

/** Normalizes text → hash → checks Text.contentHash. */
export async function checkDuplicateContent(rawText: string): Promise<DuplicateCheckResult> {
  const contentHash = computeContentHash(rawText);
  const existing = await prisma.text.findUnique({
    where: { contentHash },
    select: { id: true, title: true },
  });

  return {
    contentHash,
    isDuplicate: Boolean(existing),
    existingTextId: existing?.id ?? null,
    existingTitle: existing?.title ?? null,
  };
}
