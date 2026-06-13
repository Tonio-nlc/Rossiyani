import { knowledgeBackfillService } from "@/services/backfill";
import type { BackfillReport } from "@/types/import-pipeline";

export type RunBackfillInput = {
  textIds?: string[];
  dryRun?: boolean;
};

export async function runKnowledgeBackfill(input?: RunBackfillInput): Promise<BackfillReport> {
  return knowledgeBackfillService.run({
    textIds: input?.textIds,
    dryRun: input?.dryRun,
  });
}
