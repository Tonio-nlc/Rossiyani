import { notFound } from "next/navigation";

import { ExplorerMicroscopePanel } from "@/components/explorer/explorer-microscope-panel";
import { loadPhraseWorkspace } from "@/features/explorer/load-phrase-workspace";

type PageProps = {
  params: Promise<{ label: string }>;
};

export default async function CollocationMicroscopePage({ params }: PageProps) {
  const { label } = await params;
  const result = await loadPhraseWorkspace(label, "collocation");

  if (result.status !== "ok") {
    notFound();
  }

  return <ExplorerMicroscopePanel microscope={result.data.presentation.microscope} />;
}
