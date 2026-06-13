import { prisma } from "@/lib/prisma";

export type MergeExplanationsInput = {
  keepEntityType: "lemma" | "form" | "ending" | "phrase" | "concept";
  keepEntityId: string;
  mergeEntityIds: string[];
  canonicalExplanation: string;
  frenchComparison?: string | null;
};

/**
 * Merges knowledge entities without data loss — re-links occurrences then removes duplicates.
 */
export class MergeService {
  async mergeConcepts(keepConceptId: string, mergeConceptIds: string[]): Promise<void> {
    for (const mergeId of mergeConceptIds) {
      if (mergeId === keepConceptId) {
        continue;
      }

      await prisma.$transaction(async (tx) => {
        const lemmaLinks = await tx.knowledgeLemmaConcept.findMany({
          where: { conceptId: mergeId },
        });
        for (const link of lemmaLinks) {
          await tx.knowledgeLemmaConcept.upsert({
            where: {
              lemmaId_conceptId: { lemmaId: link.lemmaId, conceptId: keepConceptId },
            },
            create: { lemmaId: link.lemmaId, conceptId: keepConceptId },
            update: {},
          });
        }

        const endingLinks = await tx.knowledgeEndingConcept.findMany({
          where: { conceptId: mergeId },
        });
        for (const link of endingLinks) {
          await tx.knowledgeEndingConcept.upsert({
            where: {
              endingId_conceptId: { endingId: link.endingId, conceptId: keepConceptId },
            },
            create: { endingId: link.endingId, conceptId: keepConceptId },
            update: {},
          });
        }

        const phraseLinks = await tx.knowledgePhraseConcept.findMany({
          where: { conceptId: mergeId },
        });
        for (const link of phraseLinks) {
          await tx.knowledgePhraseConcept.upsert({
            where: {
              phraseId_conceptId: { phraseId: link.phraseId, conceptId: keepConceptId },
            },
            create: { phraseId: link.phraseId, conceptId: keepConceptId },
            update: {},
          });
        }

        await tx.knowledgeConceptRelation.updateMany({
          where: { fromConceptId: mergeId },
          data: { fromConceptId: keepConceptId },
        });
        await tx.knowledgeConceptRelation.updateMany({
          where: { toConceptId: mergeId },
          data: { toConceptId: keepConceptId },
        });

        const keep = await tx.knowledgeConcept.findUnique({ where: { id: keepConceptId } });
        const merge = await tx.knowledgeConcept.findUnique({ where: { id: mergeId } });
        if (keep && merge) {
          await tx.knowledgeConcept.update({
            where: { id: keepConceptId },
            data: { hitCount: keep.hitCount + merge.hitCount },
          });
        }

        await tx.knowledgeConcept.delete({ where: { id: mergeId } });
      });
    }
  }

  async mergeExplanations(input: MergeExplanationsInput): Promise<void> {
    const data = {
      canonicalExplanation: input.canonicalExplanation,
      frenchComparison: input.frenchComparison ?? undefined,
      reviewStatus: "CANONICAL" as const,
    };

    switch (input.keepEntityType) {
      case "lemma":
        await prisma.knowledgeLemma.update({ where: { id: input.keepEntityId }, data });
        break;
      case "form":
        await prisma.knowledgeForm.update({ where: { id: input.keepEntityId }, data });
        break;
      case "ending":
        await prisma.knowledgeEnding.update({
          where: { id: input.keepEntityId },
          data: { canonicalExplanation: input.canonicalExplanation, reviewStatus: "CANONICAL" },
        });
        break;
      case "phrase":
        await prisma.knowledgePhrase.update({ where: { id: input.keepEntityId }, data });
        break;
      case "concept":
        await prisma.knowledgeConcept.update({ where: { id: input.keepEntityId }, data });
        break;
    }
  }

  async mergePhraseGroups(keepPhraseId: string, mergePhraseIds: string[]): Promise<void> {
    const keep = await prisma.knowledgePhrase.findUnique({ where: { id: keepPhraseId } });
    if (!keep) {
      throw new Error("Phrase à conserver introuvable");
    }

    for (const mergeId of mergePhraseIds) {
      await prisma.$transaction(async (tx) => {
        await tx.knowledgePhraseOccurrence.updateMany({
          where: { phraseId: mergeId },
          data: { phraseId: keepPhraseId },
        });

        const links = await tx.knowledgePhraseConcept.findMany({
          where: { phraseId: mergeId },
        });
        for (const link of links) {
          await tx.knowledgePhraseConcept.upsert({
            where: {
              phraseId_conceptId: { phraseId: keepPhraseId, conceptId: link.conceptId },
            },
            create: { phraseId: keepPhraseId, conceptId: link.conceptId },
            update: {},
          });
        }

        const merge = await tx.knowledgePhrase.findUnique({ where: { id: mergeId } });
        if (merge) {
          await tx.knowledgePhrase.update({
            where: { id: keepPhraseId },
            data: {
              hitCount: keep.hitCount + merge.hitCount,
              occurrenceCount: keep.occurrenceCount + merge.occurrenceCount,
            },
          });
        }

        await tx.knowledgePhrase.delete({ where: { id: mergeId } });
      });
    }
  }

  async mergeEndings(keepEndingId: string, mergeEndingIds: string[]): Promise<void> {
    for (const mergeId of mergeEndingIds) {
      if (mergeId === keepEndingId) {
        continue;
      }

      await prisma.$transaction(async (tx) => {
        const links = await tx.knowledgeEndingConcept.findMany({
          where: { endingId: mergeId },
        });
        for (const link of links) {
          await tx.knowledgeEndingConcept.upsert({
            where: {
              endingId_conceptId: { endingId: keepEndingId, conceptId: link.conceptId },
            },
            create: { endingId: keepEndingId, conceptId: link.conceptId },
            update: {},
          });
        }

        const keep = await tx.knowledgeEnding.findUnique({ where: { id: keepEndingId } });
        const merge = await tx.knowledgeEnding.findUnique({ where: { id: mergeId } });
        if (keep && merge) {
          await tx.knowledgeEnding.update({
            where: { id: keepEndingId },
            data: { hitCount: keep.hitCount + merge.hitCount },
          });
        }

        await tx.knowledgeEnding.delete({ where: { id: mergeId } });
      });
    }
  }
}

export const mergeService = new MergeService();
