import Link from "next/link";

import { getCollectionRecord, type CollectionId } from "@/content/collections";
import type { TextListItem } from "@/features/texts";

import { HomeCollectionCover } from "./home-collection-cover";

const FEATURED_COLLECTION_IDS: CollectionId[] = ["everyday-russian", "stories", "dialogues"];

type HomeDashboardCollectionsProps = {
  texts: TextListItem[];
};

function countTextsInCollection(texts: TextListItem[], collectionId: CollectionId): number {
  return texts.filter((text) => text.collectionId === collectionId).length;
}

export function HomeDashboardCollections({ texts }: HomeDashboardCollectionsProps) {
  return (
    <section className="home-dash-section" aria-labelledby="home-dash-collections-heading">
      <div className="home-dash-section__head">
        <h2 id="home-dash-collections-heading" className="home-dash-section__title">
          Collections
        </h2>
        <p className="home-dash-section__lead">Curated reading paths for every stage of study.</p>
      </div>

      <ul className="home-dash-collections">
        {FEATURED_COLLECTION_IDS.map((collectionId) => {
          const collection = getCollectionRecord(collectionId);
          const textCount = countTextsInCollection(texts, collectionId);

          return (
            <li key={collectionId}>
              <Link href="/library" className="home-dash-card home-dash-collection focus-kb">
                <HomeCollectionCover collectionId={collectionId} />
                <div className="home-dash-collection__body">
                  <p className="home-dash-collection__count">
                    {textCount > 0 ? `${textCount} texts` : "Collection"}
                  </p>
                  <h3 className="home-dash-collection__title">{collection.name}</h3>
                  <p className="home-dash-collection__description">{collection.description}</p>
                  <span className="home-dash-collection__cta">Explore collection →</span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
