import { notFound, redirect } from "next/navigation";
import type { PartOfSpeech } from "@prisma/client";

import { EntityDetailView, LemmaDetailView } from "@/components/explorer";
import {
  buildEntityPageFromLemmaCurated,
  labelsEquivalent,
  resolveLemmaEntity,
} from "@/features/explorer/entity";

type PageProps = {
  params: Promise<{ lemma: string }>;
  searchParams: Promise<{ pos?: string }>;
};

export default async function LemmaDetailPage({ params, searchParams }: PageProps) {
  const { lemma } = await params;
  const { pos } = await searchParams;
  const preferredPos = pos as PartOfSpeech | undefined;

  const resolved = await resolveLemmaEntity(lemma, preferredPos);

  if (!resolved) {
    notFound();
  }

  if (!labelsEquivalent(resolved.requestedLemma, resolved.canonicalLemma)) {
    redirect(resolved.canonicalPath);
  }

  if (resolved.knowledge) {
    return <LemmaDetailView knowledge={resolved.knowledge} />;
  }

  if (resolved.curated) {
    const pageData = await buildEntityPageFromLemmaCurated(resolved.curated);
    return <EntityDetailView data={pageData} />;
  }

  notFound();
}
