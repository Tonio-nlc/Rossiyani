import type { ExplorerEntityPageData } from "@/features/explorer/entity";
import { practicePath } from "@/lib/practice/constants";

import { ExplorerWordPane } from "./explorer-word-pane";
import { presentationFromEntity } from "./explorer-word-presentation";
import { textPath } from "./explorer-routes";

type EntityDetailViewProps = {
  data: ExplorerEntityPageData;
};

export function EntityDetailView({ data }: EntityDetailViewProps) {
  const presentation = presentationFromEntity(data, {
    practiceHref: practicePath({
      structure: data.practiceStructure,
      mode: "structure",
      from: "explorer",
    }),
    readExamplesHref: data.relatedTexts[0]?.textId
      ? textPath(data.relatedTexts[0].textId)
      : null,
  });

  return <ExplorerWordPane presentation={presentation} breadcrumb={data.breadcrumb} />;
}
