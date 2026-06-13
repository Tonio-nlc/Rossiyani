import type { CefrLevel } from "@/types/domain";

/** Canonical Text entity — imported reading material. */
export type TextEntity = {
  id: string;
  title: string;
  level: CefrLevel;
  source: string | null;
  contentHash: string | null;
  createdAt: Date;
};

export type TextSummary = Pick<TextEntity, "id" | "title" | "level" | "source">;
