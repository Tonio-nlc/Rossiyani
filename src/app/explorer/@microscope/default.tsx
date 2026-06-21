import { getExplorerContextPanelData } from "@/features/explorer/get-explorer-context-panel";

import { ExplorerContextPanel } from "@/components/explorer/explorer-context-panel";

export default async function ExplorerMicroscopeDefault() {
  const data = await getExplorerContextPanelData();
  return <ExplorerContextPanel data={data} />;
}
