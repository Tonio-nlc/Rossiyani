import type { CSSProperties } from "react";

import { Badge, Card } from "@/components/design-system";
import type { LessonsCollection } from "@/lib/lessons/collections";

const ICON_LABELS: Record<LessonsCollection["icon"], string> = {
  foundation: "F",
  grammar: "G",
  verbs: "V",
  culture: "C",
  speech: "E",
  cases: "6",
  travel: "M",
  writing: "P",
};

type LessonsCollectionCardProps = {
  collection: LessonsCollection;
  lessonCount?: number;
};

export function LessonsCollectionCard({ collection, lessonCount }: LessonsCollectionCardProps) {
  return (
    <Card
      href={collection.href}
      className="lessons-collection-card ws-card"
      style={
        {
          "--collection-accent": collection.accent,
        } as CSSProperties
      }
    >
      <header className="ws-card__header">
        <span
          className="lessons-collection-card__cover"
          style={{ background: `linear-gradient(135deg, ${collection.accent}, ${collection.accent}cc)` }}
          aria-hidden
        >
          {ICON_LABELS[collection.icon]}
        </span>
      </header>
      <div className="ws-card__body">
        <h3 className="r3-title ws-card__title lessons-collection-card__title">{collection.title}</h3>
        <p className="r3-lead ws-card__desc lessons-collection-card__desc">{collection.description}</p>
      </div>
      <div className="ws-card__meta lessons-collection-card__meta">
        {collection.difficulty ? <Badge tone="violet">{collection.difficulty}</Badge> : null}
        {typeof lessonCount === "number" ? (
          <Badge tone="neutral">
            {lessonCount} leçon{lessonCount > 1 ? "s" : ""}
          </Badge>
        ) : null}
      </div>
    </Card>
  );
}
