import type { ExplorerEntityPageData } from "@/features/explorer/entity";
import { practicePath } from "@/lib/practice/constants";

import { ExplorerMicroscopePanel } from "./explorer-microscope-panel";
import { ExplorerStudyShell } from "./explorer-study-shell";
import { ExplorerStudySidebar } from "./explorer-study-sidebar";
import { ExplorerWordMain } from "./explorer-word-main";
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

  return (
    <ExplorerStudyShell
      sidebar={<ExplorerStudySidebar showWordNav />}
      main={<ExplorerWordMain presentation={presentation} breadcrumb={data.breadcrumb} />}
      microscope={<ExplorerMicroscopePanel presentation={presentation} />}
    />
  );
}
