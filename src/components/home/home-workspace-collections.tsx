import { getCollectionRecord, type CollectionId } from "@/content/collections";
import { EditorialCollectionCard } from "@/components/shared/editorial-collection-card";
import type { CefrLevel } from "@/types";
import type { TextListItem } from "@/features/texts";

const FEATURED_COLLECTIONS: Array<{
  id: CollectionId;
  displayName: string;
}> = [
  { id: "everyday-russian", displayName: "Everyday Russian" },
  { id: "stories", displayName: "Russian Stories" },
  { id: "dialogues", displayName: "Dialogues" },
  { id: "slow-news", displayName: "News Russian" },
];

type HomeWorkspaceCollectionsProps = {
  texts: TextListItem[];
};

function dominantLevel(texts: TextListItem[]): CefrLevel | null {
  if (texts.length === 0) {
    return null;
  }
  const order: CefrLevel[] = ["A1", "A2", "B1", "B2", "C1", "Native"];
  const counts = new Map<CefrLevel, number>();
  for (const text of texts) {
    counts.set(text.level, (counts.get(text.level) ?? 0) + 1);
  }
  let best: CefrLevel = texts[0]!.level;
  let bestCount = 0;
  for (const level of order) {
    const count = counts.get(level) ?? 0;
    if (count > bestCount) {
      best = level;
      bestCount = count;
    }
  }
  return best;
}

export function HomeWorkspaceCollections({ texts }: HomeWorkspaceCollectionsProps) {
  return (
    <section className="lessons-section" aria-labelledby="home-ws-collections-heading">
      <div className="lessons-section__head">
        <div>
          <h2 id="home-ws-collections-heading" className="r3-title lessons-section__title">
            Collections
          </h2>
          <p className="r3-lead lessons-section__subtitle">
            Parcours thématiques pour structurer vos lectures.
          </p>
        </div>
      </div>

      <div className="lessons-grid lessons-grid--collections">
        {FEATURED_COLLECTIONS.map((item) => {
          const collection = getCollectionRecord(item.id);
          const collectionTexts = texts.filter((text) => text.collectionId === item.id);
          const level = dominantLevel(collectionTexts);

          return (
            <EditorialCollectionCard
              key={item.id}
              id={item.id}
              title={item.displayName}
              description={collection.description}
              href={`/library?collection=${item.id}`}
              level={level}
              textCount={collectionTexts.length}
            />
          );
        })}
      </div>
    </section>
  );
}
