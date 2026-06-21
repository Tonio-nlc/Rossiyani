import Link from "next/link";

import { seenInText } from "@/lib/explorer/explorer-ia";

type ExplorerLemmaCard = {
  label: string;
  href: string;
  meta?: string;
};

type ExplorerTextCard = {
  textId: string;
  textTitle: string;
  occurrenceCount: number;
};

export function ExplorerLemmaCardGrid({ items }: { items: ExplorerLemmaCard[] }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="explorer-explore-grid">
      {items.map((item) => (
        <Link key={item.href} href={item.href} className="explorer-explore-card focus-kb">
          <div className="explorer-explore-card__body">
            <p className="explorer-explore-card__title break-russian">{item.label}</p>
            {item.meta ? (
              <p className="explorer-explore-card__context">{item.meta}</p>
            ) : null}
          </div>
          <span className="explorer-explore-card__cta">Explore →</span>
        </Link>
      ))}
    </div>
  );
}

export function ExplorerTextCardGrid({ items }: { items: ExplorerTextCard[] }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="explorer-explore-grid">
      {items.map((item) => (
        <Link
          key={item.textId}
          href={`/texts/${item.textId}`}
          className="explorer-explore-card focus-kb"
        >
          <div className="explorer-explore-card__body">
            <p className="explorer-explore-card__title">{item.textTitle}</p>
            <p className="explorer-explore-card__context">{seenInText(item.occurrenceCount)}</p>
          </div>
          <span className="explorer-explore-card__cta">Open →</span>
        </Link>
      ))}
    </div>
  );
}
