import type { ExplorerEndingPresentation } from "@/components/explorer/explorer-ending-presentation";
import { presentationFromEnding } from "@/components/explorer/explorer-ending-presentation";
import { getEndingGraphKnowledge } from "@/features/knowledge";

export type EndingWorkspaceData = {
  presentation: ExplorerEndingPresentation;
};

export type EndingWorkspaceLoadResult =
  | { status: "not_found" }
  | { status: "ok"; data: EndingWorkspaceData };

export async function loadEndingWorkspace(
  ending: string,
  caseKey?: string,
): Promise<EndingWorkspaceLoadResult> {
  const graph = await getEndingGraphKnowledge(decodeURIComponent(ending), caseKey);

  if (!graph) {
    return { status: "not_found" };
  }

  return {
    status: "ok",
    data: {
      presentation: presentationFromEnding(graph),
    },
  };
}
