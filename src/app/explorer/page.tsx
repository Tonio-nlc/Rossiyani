import { getKnowledgeMetrics } from "@/features/admin";
import { getLemmaBrowseCards } from "@/features/explorer/get-explorer-browse-data";
import { ExplorerHub } from "@/components/explorer";

export default async function ExplorerPage() {
  const [metrics, featuredLemmas] = await Promise.all([
    getKnowledgeMetrics().catch(() => null),
    getLemmaBrowseCards(8).catch(() => []),
  ]);

  const isEmpty =
    !metrics ||
    (metrics.graphSize.lemmas === 0 && metrics.graphSize.concepts === 0);

  return <ExplorerHub isEmpty={isEmpty} featuredLemmas={featuredLemmas} />;
}
