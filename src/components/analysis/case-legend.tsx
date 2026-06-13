"use client";

import { useState } from "react";

import {
  CASE_LEGEND_ENTRIES,
  getCaseLegendEntry,
  getCaseStyle,
  type CaseKey,
} from "@/features/grammar";

export function CaseLegend() {
  const [activeKey, setActiveKey] = useState<CaseKey | null>(null);
  const active = activeKey ? getCaseLegendEntry(activeKey) : null;

  return (
    <div className="rounded-lg border border-neutral-200 bg-white">
      <div className="flex flex-wrap items-center gap-2 px-3 py-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Cas
        </span>
        {CASE_LEGEND_ENTRIES.map((entry) => {
          const style = getCaseStyle(entry.key);
          const isActive = activeKey === entry.key;
          return (
            <button
              key={entry.key}
              type="button"
              onClick={() => setActiveKey(isActive ? null : entry.key)}
              className={[
                "rounded-md border px-2 py-1 text-xs font-medium transition",
                isActive ? "border-neutral-500 ring-1 ring-neutral-400" : "border-neutral-200",
                style?.chipBg,
                style?.chipText,
              ].join(" ")}
            >
              <span className="font-bold">{entry.typicalEndings[0]}</span>
              <span className="ml-1 opacity-80">{entry.shortLabel}</span>
            </button>
          );
        })}
      </div>
      {active ? (
        <div className="border-t border-neutral-100 px-4 py-3 text-sm">
          <p className="font-semibold text-neutral-900">{active.frenchName}</p>
          <p className="mt-1 text-neutral-600">{active.question}</p>
          <p className="mt-2">
            <span className="font-medium text-neutral-500">Terminaisons typiques : </span>
            {active.typicalEndings.join(", ")}
          </p>
          <p className="mt-2">
            <span className="font-medium text-neutral-500">Exemples : </span>
            {active.examples.join(" · ")}
          </p>
          <p className="mt-2 leading-relaxed text-neutral-700">{active.frenchContrast}</p>
        </div>
      ) : (
        <p className="border-t border-neutral-100 px-4 py-2 text-xs text-neutral-500">
          Cliquez sur un cas pour voir la question, les terminaisons et des exemples.
        </p>
      )}
    </div>
  );
}
