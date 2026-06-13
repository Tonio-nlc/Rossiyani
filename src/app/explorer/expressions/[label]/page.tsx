import { notFound } from "next/navigation";

import { PhraseDetailView } from "@/components/explorer";
import { getPhraseKnowledge } from "@/features/knowledge";

type PageProps = {
  params: Promise<{ label: string }>;
};

export default async function ExpressionDetailPage({ params }: PageProps) {
  const { label } = await params;
  const knowledge = await getPhraseKnowledge(decodeURIComponent(label));

  if (!knowledge) {
    notFound();
  }

  return (
    <PhraseDetailView
      knowledge={knowledge}
      categoryLabel="Expressions"
      categoryHref="/explorer/expressions"
    />
  );
}
