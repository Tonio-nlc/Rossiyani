import { prisma } from "@/lib/prisma";

export type ReviewCandidate = {
  type: string;
  id: string;
  label: string;
  reason: string;
  severity: "low" | "medium" | "high";
  metadata?: Record<string, string | number>;
};

/**
 * Generates review candidates for the future Admin Review Workspace.
 */
export async function generateReviewCandidates(limit = 100): Promise<ReviewCandidate[]> {
  const candidates: ReviewCandidate[] = [];

  candidates.push(...(await findDuplicateExplanations(limit)));
  candidates.push(...(await findLowConfidenceAnalyses(limit)));
  candidates.push(...(await findOrphanConcepts(limit)));
  candidates.push(...(await findUnusedLemmas(limit)));
  candidates.push(...(await findConflictingCanonicalExplanations(limit)));

  return candidates
    .sort((a, b) => severityRank(b.severity) - severityRank(a.severity))
    .slice(0, limit);
}

async function findDuplicateExplanations(limit: number): Promise<ReviewCandidate[]> {
  const forms = await prisma.knowledgeForm.findMany({
    where: { explanation: { not: "" } },
    select: { id: true, original: true, explanation: true },
    take: 500,
  });

  const byExplanation = new Map<string, typeof forms>();
  for (const form of forms) {
    const key = form.explanation.trim().toLowerCase();
    const group = byExplanation.get(key) ?? [];
    group.push(form);
    byExplanation.set(key, group);
  }

  const candidates: ReviewCandidate[] = [];
  for (const [explanation, group] of byExplanation) {
    if (group.length < 2) {
      continue;
    }
    candidates.push({
      type: "duplicate_explanation",
      id: group[0]!.id,
      label: group.map((f) => f.original).join(", "),
      reason: `Même explication partagée par ${group.length} formes`,
      severity: "medium",
      metadata: { count: group.length, explanation: explanation.slice(0, 80) },
    });
    if (candidates.length >= limit) {
      break;
    }
  }
  return candidates;
}

async function findLowConfidenceAnalyses(limit: number): Promise<ReviewCandidate[]> {
  const sentences = await prisma.sentence.findMany({
    where: { needsReview: true },
    select: { id: true, russianText: true, reviewMessage: true },
    take: limit,
  });

  return sentences.map((s) => ({
    type: "low_confidence",
    id: s.id,
    label: s.russianText.slice(0, 60),
    reason: s.reviewMessage ?? "Phrase marquée needsReview",
    severity: "high" as const,
  }));
}

async function findOrphanConcepts(limit: number): Promise<ReviewCandidate[]> {
  const concepts = await prisma.knowledgeConcept.findMany({
    include: {
      _count: {
        select: {
          lemmaLinks: true,
          endingLinks: true,
          phraseLinks: true,
        },
      },
    },
    take: limit * 2,
  });

  return concepts
    .filter(
      (c) =>
        c._count.lemmaLinks === 0 &&
        c._count.endingLinks === 0 &&
        c._count.phraseLinks === 0,
    )
    .slice(0, limit)
    .map((c) => ({
      type: "orphan_concept",
      id: c.id,
      label: c.title,
      reason: "Concept sans lemme, terminaison ni phrase liés",
      severity: "low" as const,
    }));
}

async function findUnusedLemmas(limit: number): Promise<ReviewCandidate[]> {
  const lemmas = await prisma.knowledgeLemma.findMany({
    where: { occurrenceCount: 0 },
    select: { id: true, lemma: true, partOfSpeech: true },
    take: limit,
  });

  return lemmas.map((l) => ({
    type: "unused_lemma",
    id: l.id,
    label: `${l.lemma} (${l.partOfSpeech})`,
    reason: "Lemme indexé mais sans occurrence dans le graphe",
    severity: "low" as const,
  }));
}

async function findConflictingCanonicalExplanations(limit: number): Promise<ReviewCandidate[]> {
  const lemmas = await prisma.knowledgeLemma.findMany({
    where: {
      canonicalExplanation: { not: null },
      forms: { some: { canonicalExplanation: { not: null } } },
    },
    include: {
      forms: {
        where: { canonicalExplanation: { not: null } },
        select: { id: true, original: true, canonicalExplanation: true },
        take: 3,
      },
    },
    take: limit,
  });

  const candidates: ReviewCandidate[] = [];
  for (const lemma of lemmas) {
    const lemmaCanon = lemma.canonicalExplanation?.trim();
    if (!lemmaCanon) {
      continue;
    }
    const conflicting = lemma.forms.filter(
      (f) => f.canonicalExplanation && f.canonicalExplanation.trim() !== lemmaCanon,
    );
    if (conflicting.length === 0) {
      continue;
    }
    candidates.push({
      type: "conflicting_canonical",
      id: lemma.id,
      label: lemma.lemma,
      reason: "Explication canonique du lemme différente de certaines formes",
      severity: "high" as const,
      metadata: { conflictingForms: conflicting.length },
    });
  }
  return candidates;
}

function severityRank(severity: ReviewCandidate["severity"]): number {
  return severity === "high" ? 3 : severity === "medium" ? 2 : 1;
}
