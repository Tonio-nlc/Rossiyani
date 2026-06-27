import { EditorialCollectionCard } from "@/components/shared/editorial-collection-card";
import type { HomeCollectionHighlight } from "@/lib/home/pick-home-collections";

type HomeWorkspaceCollectionsProps = {
  collections: HomeCollectionHighlight[];
};

export function HomeWorkspaceCollections({ collections }: HomeWorkspaceCollectionsProps) {
  if (collections.length === 0) {
    return null;
  }

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

      <div className="lessons-grid lessons-grid--collections ws-card-grid ws-card-grid--collections">
        {collections.map((item) => (
          <div key={item.id} className="ws-card-grid__cell">
            <EditorialCollectionCard
              id={item.id}
              title={item.title}
              description={item.description}
              href={item.href}
              level={item.level}
              textCount={item.textCount}
              eyebrow={item.reason}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
