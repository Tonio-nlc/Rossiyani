"use client";

import { useState, type ReactNode } from "react";

import { clampToSentences } from "@/lib/formatting/clamp-text";
import {
  DIFFICULTY_SCORE_LABELS,
  REGISTER_LABELS,
  type DifficultyScore,
  type Register,
} from "@/types";

import type { SentenceDetail } from "@/features/sentences";

type SentenceInsightBarProps = {
  sentence: SentenceDetail | null;
  loading?: boolean;
};

export function SentenceInsightBar({ sentence, loading }: SentenceInsightBarProps) {
  const [expandLogic, setExpandLogic] = useState(false);
  const [expandOrder, setExpandOrder] = useState(false);

  if (loading) {
    return <Shell>Chargement de la phrase…</Shell>;
  }

  if (!sentence) {
    return (
      <Shell>
        <p className="text-sm text-neutral-500">
          Cliquez sur une phrase pour voir les traductions et la logique russe.
        </p>
      </Shell>
    );
  }

  const logic = clampToSentences(sentence.russianLogic, 3);
  const order = clampToSentences(sentence.orderExplanation, 2);
  const usage = clampToSentences(sentence.nativeUsageNotes, 1);

  return (
    <Shell>
      <div className="grid gap-4 lg:grid-cols-12 lg:gap-6">
        <div className="lg:col-span-5">
          <p className="text-xs font-semibold uppercase text-neutral-400">Traduction naturelle</p>
          <p className="mt-1 text-xl font-medium leading-snug text-neutral-900">
            {sentence.naturalTranslation}
          </p>
          <p className="mt-3 text-xs font-semibold uppercase text-neutral-400">
            Traduction littérale
          </p>
          <p className="mt-1 text-sm italic text-neutral-600">{sentence.literalTranslation}</p>
        </div>

        <div className="lg:col-span-4">
          <InsightSection
            title="Logique russe"
            body={logic.text}
            truncated={logic.truncated}
            expanded={expandLogic}
            onToggle={() => setExpandLogic((v) => !v)}
            fullBody={sentence.russianLogic}
          />
          <InsightSection
            title="Ordre des mots"
            body={order.text}
            truncated={order.truncated}
            expanded={expandOrder}
            onToggle={() => setExpandOrder((v) => !v)}
            fullBody={sentence.orderExplanation}
            className="mt-3"
          />
        </div>

        <div className="lg:col-span-3">
          <p className="text-lg font-medium text-neutral-800">{sentence.russianText}</p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-neutral-100 px-2 py-1 text-neutral-600">
              {REGISTER_LABELS[sentence.register as Register]}
            </span>
            <span className="rounded-full bg-neutral-100 px-2 py-1 text-neutral-600">
              {DIFFICULTY_SCORE_LABELS[sentence.difficultyScore as DifficultyScore]}
            </span>
          </div>
          <p className="mt-3 text-sm text-neutral-600">{usage.text}</p>
          {sentence.needsReview ? (
            <p className="mt-2 rounded border border-amber-300 bg-amber-50 px-2 py-1.5 text-xs text-amber-900">
              {sentence.reviewMessage ?? "Analyse à réviser."}
            </p>
          ) : null}
        </div>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-neutral-500">
        Contexte de la phrase
      </h2>
      {children}
    </section>
  );
}

function InsightSection({
  title,
  body,
  truncated,
  expanded,
  onToggle,
  fullBody,
  className = "",
}: {
  title: string;
  body: string;
  truncated: boolean;
  expanded: boolean;
  onToggle: () => void;
  fullBody: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-xs font-semibold uppercase text-neutral-400">{title}</p>
      <p className="mt-1 text-sm leading-relaxed text-neutral-800">
        {expanded ? fullBody : body}
      </p>
      {truncated ? (
        <button
          type="button"
          onClick={onToggle}
          className="mt-1 text-xs font-medium text-neutral-600 underline hover:text-neutral-900"
        >
          {expanded ? "Réduire" : "Voir plus"}
        </button>
      ) : null}
    </div>
  );
}
