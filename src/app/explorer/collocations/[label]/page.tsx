import { notFound, redirect } from "next/navigation";

import { PhraseDetailView } from "@/components/explorer";
import { loadPhraseWorkspace } from "@/features/explorer/load-phrase-workspace";

type PageProps = {
  params: Promise<{ label: string }>;
};

export default async function CollocationDetailPage({ params }: PageProps) {
  const { label } = await params;
  const result = await loadPhraseWorkspace(label, "collocation");

  if (result.status === "redirect") {
    redirect(result.path);
  }

  if (result.status !== "ok") {
    notFound();
  }

  return <PhraseDetailView presentation={result.data.presentation} />;
}
