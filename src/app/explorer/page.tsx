import { getKnowledgeMetrics } from "@/features/admin";
import { getDailyConnection } from "@/features/home";
import { getExplorerIndex, getKnowledgeCanvas } from "@/features/explorer";
import { listTexts } from "@/features/texts";
import { ExplorerHub } from "@/components/explorer";

export default async function ExplorerPage() {
  const texts = await listTexts();
  const [metrics, indexTopics, canvas, dailyConnection] = await Promise.all([
    getKnowledgeMetrics().catch(() => null),
    getExplorerIndex(texts.length),
    getKnowledgeCanvas(),
    getDailyConnection(),
  ]);

  const isEmpty =
    !metrics ||
    (metrics.graphSize.lemmas === 0 && metrics.graphSize.concepts === 0);

  return (
    <ExplorerHub
      indexTopics={indexTopics}
      canvas={canvas}
      dailyConnection={dailyConnection}
      textCount={texts.length}
      isEmpty={isEmpty}
    />
  );
}
