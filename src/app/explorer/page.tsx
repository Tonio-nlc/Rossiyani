import { getKnowledgeMetrics } from "@/features/admin";
import { getExplorerEditorialData } from "@/features/explorer/get-explorer-editorial";
import { ExplorerHub } from "@/components/explorer";

export default async function ExplorerPage() {
  const [metrics, editorial] = await Promise.all([
    getKnowledgeMetrics().catch(() => null),
    getExplorerEditorialData(),
  ]);

  const isEmpty =
    !metrics ||
    (metrics.graphSize.lemmas === 0 && metrics.graphSize.concepts === 0);

  return <ExplorerHub editorial={editorial} isEmpty={isEmpty} />;
}
