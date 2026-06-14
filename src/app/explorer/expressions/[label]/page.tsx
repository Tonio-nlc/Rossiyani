import { notFound } from "next/navigation";

import { EntityDetailView } from "@/components/explorer/entity-detail-view";
import {
  buildEntityPageFromCuratedPhrase,
  buildEntityPageFromPhraseKnowledge,
  redirectIfCanonicalMismatch,
  resolvePhraseEntity,
} from "@/features/explorer/entity";

type PageProps = {
  params: Promise<{ label: string }>;
};

export default async function ExpressionDetailPage({ params }: PageProps) {
  const { label } = await params;
  const resolved = await resolvePhraseEntity(label, { routeKind: "expression" });

  if (!resolved) {
    notFound();
  }

  redirectIfCanonicalMismatch(
    resolved.requestedLabel,
    resolved.canonicalLabel,
    resolved.canonicalPath,
  );

  if (resolved.knowledge) {
    const pageData = await buildEntityPageFromPhraseKnowledge(
      resolved.knowledge,
      resolved.routeHint,
    );
    return <EntityDetailView data={pageData} />;
  }

  if (resolved.curated) {
    const pageData = await buildEntityPageFromCuratedPhrase(
      resolved.curated,
      resolved.routeHint,
    );
    return <EntityDetailView data={pageData} />;
  }

  notFound();
}
