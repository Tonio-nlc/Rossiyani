import type { CSSProperties } from "react";
import Link from "next/link";

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
    <Link
      href={collection.href}
      className="lessons-collection-card focus-kb"
      style={
        {
          "--collection-accent": collection.accent,
        } as CSSProperties
      }
    >
      <span
        className="lessons-collection-card__cover"
        style={{ background: `linear-gradient(135deg, ${collection.accent}, ${collection.accent}cc)` }}
        aria-hidden
      >
        {ICON_LABELS[collection.icon]}
      </span>
      <h3 className="lessons-collection-card__title">{collection.title}</h3>
      <p className="lessons-collection-card__desc">{collection.description}</p>
      <div className="lessons-collection-card__meta">
        {collection.difficulty ? (
          <span className="lessons-tag lessons-tag--accent">{collection.difficulty}</span>
        ) : null}
        {typeof lessonCount === "number" ? (
          <span className="lessons-tag">
            {lessonCount} leçon{lessonCount > 1 ? "s" : ""}
          </span>
        ) : null}
      </div>
    </Link>
  );
}
