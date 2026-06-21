import { notFound } from "next/navigation";

import { ExplorerMicroscopePanel } from "@/components/explorer/explorer-microscope-panel";
import { loadEndingWorkspace } from "@/features/explorer/load-ending-workspace";

type PageProps = {
  params: Promise<{ ending: string }>;
  searchParams: Promise<{ case?: string }>;
};

export default async function EndingMicroscopePage({ params, searchParams }: PageProps) {
  const { ending } = await params;
  const { case: caseKey } = await searchParams;
  const result = await loadEndingWorkspace(ending, caseKey);

  if (result.status !== "ok") {
    notFound();
  }

  return <ExplorerMicroscopePanel microscope={result.data.presentation.microscope} />;
}
