import { notFound, redirect } from "next/navigation";

import { ConceptDetailView, EntityDetailView } from "@/components/explorer";
import { caseKeyFromConceptKey, casePath } from "@/components/explorer/explorer-routes";
import {
  buildEntityPageFromConceptCurated,
  isCaseConcept,
  labelsEquivalent,
  resolveConceptEntity,
} from "@/features/explorer/entity";
import {
  getConceptKnowledge,
  getLemmaKnowledge,
  getPhraseKnowledge,
} from "@/features/knowledge";
import type { RelatedTextRef } from "@/types/knowledge-graph";

type PageProps = {
  params: Promise<{ key: string }>;
};

async function collectRelatedTexts(concept: NonNullable<Awaited<ReturnType<typeof getConceptKnowledge>>>) {
  const seen = new Set<string>();
  const texts: RelatedTextRef[] = [];

  const add = (t: RelatedTextRef) => {
    const id = `${t.textId}:${t.sentenceRussian}`;
    if (!seen.has(id)) {
      seen.add(id);
      texts.push(t);
    }
  };

  for (const lemma of concept.lemmas.slice(0, 4)) {
    const lk = await getLemmaKnowledge(lemma.lemma, lemma.partOfSpeech);
    lk?.relatedTexts.slice(0, 3).forEach(add);
  }

  for (const phrase of concept.phrases.slice(0, 4)) {
    const pk = await getPhraseKnowledge(phrase.label);
    pk?.relatedTexts.slice(0, 3).forEach(add);
  }

  return texts.slice(0, 12);
}

export default async function ConceptDetailPage({ params }: PageProps) {
  const { key } = await params;
  const resolved = await resolveConceptEntity(key);

  if (!resolved) {
    notFound();
  }

  if (
    !labelsEquivalent(resolved.requestedKey, resolved.canonicalKey) &&
    !labelsEquivalent(resolved.requestedKey, resolved.canonicalTitle)
  ) {
    redirect(resolved.canonicalPath);
  }

  if (resolved.knowledge) {
    const { concept } = resolved.knowledge;
    if (isCaseConcept(concept.conceptKey, concept.category)) {
      const caseKey = caseKeyFromConceptKey(concept.conceptKey);
      if (caseKey) {
        redirect(casePath(caseKey));
      }
    }

    const relatedTexts = await collectRelatedTexts(resolved.knowledge);
    return <ConceptDetailView concept={resolved.knowledge} relatedTexts={relatedTexts} />;
  }

  if (resolved.curated) {
    const pageData = await buildEntityPageFromConceptCurated(resolved.curated);
    return <EntityDetailView data={pageData} />;
  }

  notFound();
}
