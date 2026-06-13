import {
  DIFFICULTY_SCORE_LABELS,
  REGISTER_LABELS,
  type DifficultyScore,
  type Register,
} from "@/types";

import type { SentenceDetail } from "@/features/sentences";

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
        <p className="text-sm text-neutral-500">Cliquez sur une phrase pour voir l&apos;analyse.</p>
      </PanelShell>
    );
  }

  const difficulty = DIFFICULTY_SCORE_LABELS[sentence.difficultyScore as DifficultyScore];
  const register = REGISTER_LABELS[sentence.register as Register];

  return (
    <PanelShell title="Analyse de la phrase">
      <p className="text-lg font-medium">{sentence.russianText}</p>
      <MetaRow label="Registre" value={register} />
      <MetaRow label="Difficulté" value={difficulty} />
      <Section title="Traduction littérale" body={sentence.literalTranslation} />
      <Section title="Traduction naturelle" body={sentence.naturalTranslation} />
      <Section title="Logique russe" body={sentence.russianLogic} />
      <Section title="Ordre des mots" body={sentence.orderExplanation} />
      <Section title="Usage natif" body={sentence.nativeUsageNotes} />
      {sentence.needsReview ? (
        <p className="rounded border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          {sentence.reviewMessage ?? "Analyse à réviser."}
        </p>
      ) : null}
    </PanelShell>
  );
}

function PanelShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <aside className="rounded-lg border border-neutral-200 bg-white p-4">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500">
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </aside>
  );
}

function Section({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase text-neutral-500">{title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-neutral-800">{body}</p>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <p className="text-sm text-neutral-600">
      <span className="font-medium text-neutral-500">{label} :</span> {value}
    </p>
  );
}
