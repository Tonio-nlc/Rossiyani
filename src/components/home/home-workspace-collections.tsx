import Link from "next/link";

import { getCollectionRecord, type CollectionId } from "@/content/collections";
import type { CefrLevel } from "@/types";
import type { TextListItem } from "@/features/texts";

import { HomeCollectionCover } from "./home-collection-cover";

const FEATURED_COLLECTIONS: Array<{
  id: CollectionId;
  displayName: string;
  featured?: boolean;
}> = [
  { id: "everyday-russian", displayName: "Everyday Russian", featured: true },
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
    <section className="home-ws-section home-ws-section--surface-pearl" aria-labelledby="home-ws-collections-heading">
      <div className="home-ws-section__head">
        <h2 id="home-ws-collections-heading" className="home-ws-section__title">
          Featured collections
        </h2>
      </div>

      <ul className="home-ws-collection-grid">
        {FEATURED_COLLECTIONS.map((item) => {
          const collection = getCollectionRecord(item.id);
          const collectionTexts = texts.filter((text) => text.collectionId === item.id);
          const level = dominantLevel(collectionTexts);

          return (
            <li
              key={item.id}
              className={item.featured ? "home-ws-collection-grid__featured" : undefined}
            >
              <Link href="/library" className="home-ws-card home-ws-collection focus-kb">
                <HomeCollectionCover collectionId={item.id} />
                <div className="home-ws-collection__body">
                  <div className="home-ws-collection__badges">
                    {level ? <span className="home-ws-badge">{level}</span> : null}
                    <span className="home-ws-badge home-ws-badge--muted">
                      {collectionTexts.length} text{collectionTexts.length === 1 ? "" : "s"}
                    </span>
                  </div>
                  <h3 className="home-ws-collection__title">{item.displayName}</h3>
                  <p className="home-ws-collection__description">{collection.description}</p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
