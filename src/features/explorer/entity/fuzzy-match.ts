import { prisma } from "@/lib/prisma";
import { phraseLookupKey, toRussianLookupKey, conceptLookupKey } from "@/lib/normalization/russian-key";
import { findClosestKnownForm } from "@/services/import-quality/levenshtein";

export async function findPhraseRowExact(label: string) {
  return prisma.knowledgePhrase.findUnique({
    where: { labelKey: phraseLookupKey(label) },
    select: { label: true, type: true },
  });
}

export async function findPhraseRowFuzzy(label: string) {
  const exact = await findPhraseRowExact(label);
  if (exact) {
    return exact;
  }

  const key = phraseLookupKey(label);
  const trimmed = label.trim();
  const firstWord = trimmed.split(/\s+/)[0] ?? trimmed;

  const candidates = await prisma.knowledgePhrase.findMany({
    where: {
      OR: [
        { label: { contains: trimmed, mode: "insensitive" } },
        { label: { startsWith: firstWord, mode: "insensitive" } },
      ],
    },
    orderBy: { occurrenceCount: "desc" },
    take: 24,
    select: { label: true, type: true, labelKey: true },
  });

  if (candidates.length === 0) {
    return null;
  }

  const closestKey = findClosestKnownForm(
    key,
    candidates.map((candidate) => candidate.labelKey),
    3,
  );
  if (!closestKey) {
    return candidates[0] ?? null;
  }

  return candidates.find((candidate) => candidate.labelKey === closestKey) ?? candidates[0] ?? null;
}

export async function findLemmaRowFuzzy(lemma: string) {
  const key = toRussianLookupKey(lemma);
  const exact = await prisma.knowledgeLemma.findFirst({
    where: { lemma: { equals: lemma, mode: "insensitive" } },
    select: { lemma: true, partOfSpeech: true },
  });
  if (exact) {
    return exact;
  }

  const candidates = await prisma.knowledgeLemma.findMany({
    where: {
      OR: [
        { lemma: { contains: lemma.trim(), mode: "insensitive" } },
        { lemma: { startsWith: lemma.trim().slice(0, 3), mode: "insensitive" } },
      ],
    },
    orderBy: { occurrenceCount: "desc" },
    take: 24,
    select: { lemma: true, partOfSpeech: true },
  });

  if (candidates.length === 0) {
    return null;
  }

  const closest = findClosestKnownForm(
    key,
    candidates.map((candidate) => toRussianLookupKey(candidate.lemma)),
    3,
  );
  if (!closest) {
    return candidates[0] ?? null;
  }

  return (
    candidates.find((candidate) => toRussianLookupKey(candidate.lemma) === closest) ??
    candidates[0] ??
    null
  );
}

export async function findConceptRowFuzzy(keyOrTitle: string) {
  const key = conceptLookupKey(keyOrTitle);
  const exact = await prisma.knowledgeConcept.findFirst({
    where: {
      OR: [
        { conceptKey: key },
        { conceptKey: keyOrTitle },
        { title: { equals: keyOrTitle, mode: "insensitive" } },
      ],
    },
    select: { conceptKey: true, title: true },
  });
  if (exact) {
    return exact;
  }

  const candidates = await prisma.knowledgeConcept.findMany({
    where: {
      OR: [
        { title: { contains: keyOrTitle.trim(), mode: "insensitive" } },
        { conceptKey: { contains: key, mode: "insensitive" } },
      ],
    },
    orderBy: { hitCount: "desc" },
    take: 24,
    select: { conceptKey: true, title: true },
  });

  if (candidates.length === 0) {
    return null;
  }

  const closest = findClosestKnownForm(
    key,
    candidates.map((candidate) => conceptLookupKey(candidate.conceptKey)),
    3,
  );
  if (!closest) {
    return candidates[0] ?? null;
  }

  return (
    candidates.find((candidate) => conceptLookupKey(candidate.conceptKey) === closest) ??
    candidates[0] ??
    null
  );
}
