import { notFound } from "next/navigation";

import { ConceptDetailView } from "@/components/explorer";
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
  const decoded = decodeURIComponent(key);
  const concept = await getConceptKnowledge(decoded);

  if (!concept) {
    notFound();
  }

  const relatedTexts = await collectRelatedTexts(concept);

  return <ConceptDetailView concept={concept} relatedTexts={relatedTexts} />;
}
