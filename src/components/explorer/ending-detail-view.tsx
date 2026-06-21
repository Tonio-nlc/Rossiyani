import type { ExplorerEndingPresentation } from "./explorer-ending-presentation";

import { ExplorerEndingPane } from "./explorer-ending-pane";

type EndingDetailViewProps = {
  presentation: ExplorerEndingPresentation;
};

export function EndingDetailView({ presentation }: EndingDetailViewProps) {
  return (
    <div className="explorer-workspace-pane explorer-workspace-pane--detail">
      <ExplorerEndingPane presentation={presentation} />
    </div>
  );
}
