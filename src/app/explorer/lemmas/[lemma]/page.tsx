import { notFound } from "next/navigation";
import type { PartOfSpeech } from "@prisma/client";

import { LemmaDetailView } from "@/components/explorer";
import { getLemmaKnowledge } from "@/features/knowledge";

const POS_FALLBACK: PartOfSpeech[] = ["noun", "verb", "adjective", "adverb", "pronoun", "preposition"];

type PageProps = {
  params: Promise<{ lemma: string }>;
  searchParams: Promise<{ pos?: string }>;
};

export default async function LemmaDetailPage({ params, searchParams }: PageProps) {
  const { lemma } = await params;
  const { pos } = await searchParams;
  const decoded = decodeURIComponent(lemma);

  let knowledge = pos
    ? await getLemmaKnowledge(decoded, pos as PartOfSpeech)
    : null;

  if (!knowledge) {
    for (const p of POS_FALLBACK) {
      if (pos && p === pos) {
        continue;
      }
      knowledge = await getLemmaKnowledge(decoded, p);
      if (knowledge) {
        break;
      }
    }
  }

  if (!knowledge) {
    notFound();
  }

  return <LemmaDetailView knowledge={knowledge} />;
}
