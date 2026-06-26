import type { CSSProperties } from "react";

import { Badge, Card } from "@/components/design-system";
import type { CollectionId } from "@/content/collections";
import type { CefrLevel } from "@/types";

const COLLECTION_ACCENTS: Partial<Record<CollectionId, string>> = {
  "everyday-russian": "#0058be",
  stories: "#6366f1",
  dialogues: "#059669",
  "slow-news": "#b45309",
  telegram: "#0ea5e9",
  "travel-russian": "#ec4899",
  culture: "#8b5cf6",
};

const COLLECTION_ICONS: Partial<Record<CollectionId, string>> = {
  "everyday-russian": "E",
  stories: "S",
  dialogues: "D",
  "slow-news": "N",
  telegram: "T",
  "travel-russian": "V",
  culture: "C",
};

type EditorialCollectionCardProps = {
  id: CollectionId;
  title: string;
  description: string;
  href: string;
  level?: CefrLevel | null;
  textCount?: number;
  progressPercent?: number;
};

export function EditorialCollectionCard({
  id,
  title,
  description,
  href,
  level = null,
  textCount = 0,
  progressPercent,
}: EditorialCollectionCardProps) {
  const accent = COLLECTION_ACCENTS[id] ?? "#64748b";
  const icon = COLLECTION_ICONS[id] ?? title.charAt(0);

  return (
    <Card
      href={href}
      className="lessons-collection-card ws-card"
      style={{ "--collection-accent": accent } as CSSProperties}
    >
      <header className="ws-card__header">
        <span
          className="lessons-collection-card__cover"
          style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }}
          aria-hidden
        >
          {icon}
        </span>
      </header>
      <div className="ws-card__body">
        <h3 className="r3-title ws-card__title lessons-collection-card__title">{title}</h3>
        <p className="r3-lead ws-card__desc lessons-collection-card__desc">{description}</p>
      </div>
      <div className="ws-card__meta lessons-collection-card__meta">
        {level ? <Badge tone="blue">{level}</Badge> : null}
        {textCount > 0 ? (
          <Badge tone="neutral">
            {textCount} text{textCount === 1 ? "" : "s"}
          </Badge>
        ) : null}
        {typeof progressPercent === "number" && progressPercent > 0 ? (
          <Badge tone="green">{progressPercent}%</Badge>
        ) : null}
      </div>
    </Card>
  );
}
