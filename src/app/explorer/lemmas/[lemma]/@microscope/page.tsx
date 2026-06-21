import { notFound } from "next/navigation";
import type { PartOfSpeech } from "@prisma/client";

import { ExplorerMicroscopePanel } from "@/components/explorer/explorer-microscope-panel";
import { loadLemmaWorkspace } from "@/features/explorer/load-lemma-workspace";

type PageProps = {
  params: Promise<{ lemma: string }>;
  searchParams: Promise<{ pos?: string }>;
};

export default async function LemmaMicroscopePage({ params, searchParams }: PageProps) {
  const { lemma } = await params;
  const { pos } = await searchParams;
  const result = await loadLemmaWorkspace(lemma, pos as PartOfSpeech | undefined);

  if (result.status !== "ok") {
    notFound();
  }

  return <ExplorerMicroscopePanel microscope={result.data.presentation.microscope} />;
}
