import Link from "next/link";

import { seenInText } from "@/lib/explorer/explorer-ia";
import type { ExplorerRelatedWord, ExplorerTextOccurrence } from "@/lib/explorer/explorer-ia";

type ExplorerLemmaCard = ExplorerRelatedWord;

export function ExplorerLemmaCardGrid({ items }: { items: ExplorerLemmaCard[] }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="explorer-related-grid">
      {items.map((item) => (
        <Link key={item.href} href={item.href} className="explorer-related-card focus-kb">
          <div className="explorer-related-card__body">
            <p className="explorer-related-card__title break-russian">{item.label}</p>
            {item.hint ? <p className="explorer-related-card__hint">{item.hint}</p> : null}
          </div>
          <span className="explorer-related-card__cta">Explore →</span>
        </Link>
      ))}
    </div>
  );
}

export function ExplorerTextCardGrid({ items }: { items: ExplorerTextOccurrence[] }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="explorer-text-grid">
      {items.map((item) => (
        <Link
          key={item.textId}
          href={`/texts/${item.textId}`}
          className="explorer-text-card focus-kb"
        >
          <div className="explorer-text-card__body">
            <p className="explorer-text-card__title">{item.textTitle}</p>
            <p className="explorer-text-card__context">{seenInText(item.occurrenceCount)}</p>
            {item.previewSnippet ? (
              <p className="explorer-text-card__preview break-russian font-reader">
                “{item.previewSnippet}”
              </p>
            ) : null}
          </div>
          <span className="explorer-text-card__cta">Open →</span>
        </Link>
      ))}
    </div>
  );
}
