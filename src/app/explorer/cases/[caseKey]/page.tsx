import { notFound } from "next/navigation";

import { CaseDetailView } from "@/components/explorer";
import { getCaseKnowledge } from "@/features/knowledge";

type PageProps = {
  params: Promise<{ caseKey: string }>;
};

export default async function CaseDetailPage({ params }: PageProps) {
  const { caseKey } = await params;
  const graph = await getCaseKnowledge(decodeURIComponent(caseKey));

  if (!graph) {
    notFound();
  }

  return <CaseDetailView graph={graph} />;
}
