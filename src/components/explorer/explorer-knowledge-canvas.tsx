import type { KnowledgeCanvasData } from "@/features/explorer";

import { KnowledgeChain, MarginNote, Reference } from "@/components/editorial";

type ExplorerKnowledgeCanvasProps = {
  canvas: KnowledgeCanvasData;
};

export function ExplorerKnowledgeCanvas({ canvas }: ExplorerKnowledgeCanvasProps) {
  return (
    <div className="space-y-[var(--space-3)]">
      <p className="font-reader text-2xl text-[var(--ink)]">
        <Reference href={canvas.focalHref}>{canvas.focalLabel}</Reference>
      </p>
      <KnowledgeChain items={canvas.chain} />
      {canvas.note ? <MarginNote kind="grammar">{canvas.note}</MarginNote> : null}
    </div>
  );
}
