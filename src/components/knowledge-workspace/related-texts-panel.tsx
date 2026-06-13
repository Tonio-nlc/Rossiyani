import Link from "next/link";

import type { WordDetailGraph } from "@/types/word-detail-graph";
import type { WordDetailSection } from "@/types/word-detail-graph";

type RelatedTextsPanelProps = {
  detail: WordDetailGraph;
  currentTextId?: string;
  loadingSections?: WordDetailSection[];
};

export function RelatedTextsPanel({
  detail,
  currentTextId,
  loadingSections = [],
}: RelatedTextsPanelProps) {
  const loading = loadingSections.includes("related");
  const filtered = detail.relatedTexts.filter((ref) => ref.textId !== currentTextId);

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-lg bg-neutral-100" />
        ))}
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <p className="text-sm text-neutral-500">
        Ce lemme ou cette construction n&apos;apparaît pas encore dans d&apos;autres textes importés.
      </p>
    );
  }

  return (
    <ul className="space-y-2 animate-shared-enter" style={{ animationDelay: "300ms" }}>
      {filtered.map((ref) => (
        <li key={`${ref.textId}-${ref.sentenceRussian}`}>
          <Link
            href={`/texts/${ref.textId}`}
            className="group block rounded-lg border border-neutral-200 bg-white px-3 py-2.5 transition hover:border-violet-300 hover:shadow-md panel-transition"
          >
            <p className="text-sm font-medium text-neutral-900 group-hover:text-violet-900">
              {ref.textTitle}
            </p>
            <p className="mt-1 text-sm text-neutral-600">{ref.sentenceRussian}</p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
