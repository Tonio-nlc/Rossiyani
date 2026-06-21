import type { ExplorerWordPresentation } from "./explorer-word-presentation";
import { ExplorerWordPane } from "./explorer-word-pane";

type LemmaDetailViewProps = {
  presentation: ExplorerWordPresentation;
  breadcrumb: Array<{ label: string; href?: string }>;
};

export function LemmaDetailView({ presentation, breadcrumb }: LemmaDetailViewProps) {
  return <ExplorerWordPane presentation={presentation} breadcrumb={breadcrumb} />;
}
