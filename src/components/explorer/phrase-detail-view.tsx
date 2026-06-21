import type { ExplorerPhrasePresentation } from "./explorer-phrase-presentation";

import { ExplorerPhrasePane } from "./explorer-phrase-pane";

type PhraseDetailViewProps = {
  presentation: ExplorerPhrasePresentation;
};

export function PhraseDetailView({ presentation }: PhraseDetailViewProps) {
  return (
    <div className="explorer-workspace-pane explorer-workspace-pane--detail">
      <ExplorerPhrasePane presentation={presentation} />
    </div>
  );
}
