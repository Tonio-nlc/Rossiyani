import { notFound } from "next/navigation";

import { EndingDetailView } from "@/components/explorer";
import { getEndingGraphKnowledge } from "@/features/knowledge";

type PageProps = {
  params: Promise<{ ending: string }>;
  searchParams: Promise<{ case?: string }>;
};

export default async function EndingDetailPage({ params, searchParams }: PageProps) {
  const { ending } = await params;
  const { case: caseKey } = await searchParams;
  const graph = await getEndingGraphKnowledge(decodeURIComponent(ending), caseKey);

  if (!graph) {
    notFound();
  }

  return <EndingDetailView graph={graph} />;
}
