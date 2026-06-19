import {
  DIFFICULTY_SCORE_LABELS,
  REGISTER_LABELS,
  type DifficultyScore,
  type Register,
} from "@/types";

import type { SentenceDetail } from "@/features/sentences";
import { WorkspacePanel } from "@/components/knowledge-workspace/workspace-panel";

type SentencePanelProps = {
  sentence: SentenceDetail | null;
  loading?: boolean;
};

export function SentencePanel({ sentence, loading }: SentencePanelProps) {
  if (loading) {
    return <PanelShell title="Analyse de la phrase">Chargement…</PanelShell>;
  }
  if (!sentence) {
    return (
      <PanelShell title="Analyse de la phrase">
        <p className="text-sm text-[var(--ink-muted)]">
          Cliquez sur une phrase pour voir l&apos;analyse.
        </p>
      </PanelShell>
    );
  }

  const difficulty = DIFFICULTY_SCORE_LABELS[sentence.difficultyScore as DifficultyScore];
  const register = REGISTER_LABELS[sentence.register as Register];

  return (
    <PanelShell title="Analyse de la phrase">
      <p className="font-reader text-lg text-[var(--ink)]">{sentence.russianText}</p>
      <MetaRow label="Registre" value={register} />
      <MetaRow label="Difficulté" value={difficulty} />
      <Section title="Traduction littérale" body={sentence.literalTranslation} />
      <Section title="Traduction naturelle" body={sentence.naturalTranslation} />
      <Section title="Logique russe" body={sentence.russianLogic} />
      <Section title="Ordre des mots" body={sentence.orderExplanation} />
      <Section title="Usage natif" body={sentence.nativeUsageNotes} />
      {sentence.needsReview ? (
        <p className="border border-[var(--color-secondary)] px-3 py-2 text-sm text-[var(--color-secondary)]">
          {sentence.reviewMessage ?? "Analyse à réviser."}
        </p>
      ) : null}
    </PanelShell>
  );
}

function PanelShell({ title, children }: { title: string; children: React.ReactNode }) {
  return <WorkspacePanel title={title}>{children}</WorkspacePanel>;
}

function Section({ title, body }: { title: string; body: string }) {
  return (
    <section className="space-y-1">
      <h3 className="text-eyebrow">{title}</h3>
      <p className="text-sm leading-relaxed text-[var(--ink-secondary)]">{body}</p>
    </section>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 text-sm">
      <span className="text-[var(--ink-muted)]">{label}</span>
      <span className="text-[var(--ink-secondary)]">{value}</span>
    </div>
  );
}
