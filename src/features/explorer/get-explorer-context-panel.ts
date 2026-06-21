import { getExplorerEditorialData } from "@/features/explorer/get-explorer-editorial";
import {
  getConceptBrowseCards,
  getRandomDiscoveryCard,
} from "@/features/explorer/get-explorer-browse-data";

import type { ExplorerContextPanelData } from "@/components/explorer/explorer-context-panel";

export async function getExplorerContextPanelData(): Promise<ExplorerContextPanelData> {
  const [editorial, relatedConcepts, randomDiscovery] = await Promise.all([
    getExplorerEditorialData(),
    getConceptBrowseCards(4),
    getRandomDiscoveryCard(),
  ]);

  return {
    editorial,
    relatedConcepts,
    randomDiscovery,
  };
}
