import { EmptyState } from "@/components/ui/empty-state";
import type { TextListItem } from "@/features/texts";

import { LibrarySuggestCard } from "./library-suggest-card";
import { LibraryTextCard } from "./library-text-card";

type LibraryEditorialGridProps = {
  texts: TextListItem[];
  hasAnyTexts: boolean;
  busyTextId?: string | null;
  removingTextId?: string | null;
  onRename: (text: TextListItem) => void;
  onDelete: (text: TextListItem) => void;
};

export function LibraryEditorialGrid({
  texts,
  hasAnyTexts,
  busyTextId = null,
  removingTextId = null,
  onRename,
  onDelete,
}: LibraryEditorialGridProps) {
  if (texts.length === 0 && !hasAnyTexts) {
    return (
      <EmptyState
        icon="📚"
        title="Votre bibliothèque est vide"
        description="Importez un texte pour commencer."
        action={{ label: "Importer →", href: "/import" }}
      />
    );
  }

  if (texts.length === 0) {
    return (
      <EmptyState
        icon="🔍"
        title="Aucun texte ne correspond"
        description="Modifiez les filtres."
      />
    );
  }

  const [featured, ...rest] = texts;

  return (
    <div className="lib-editorial-grid">
      <div
        className={[
          "lib-editorial-grid__cell lib-editorial-grid__cell-featured",
          removingTextId === featured.id ? "animate-fade-out" : "",
        ].join(" ")}
      >
        <LibraryTextCard
          text={featured}
          variant="featured"
          disabled={busyTextId === featured.id}
          onRename={onRename}
          onDelete={onDelete}
        />
      </div>

      {rest.map((text) => (
        <div
          key={text.id}
          className={[
            "lib-editorial-grid__cell",
            removingTextId === text.id ? "animate-fade-out" : "",
          ].join(" ")}
        >
          <LibraryTextCard
            text={text}
            disabled={busyTextId === text.id}
            onRename={onRename}
            onDelete={onDelete}
          />
        </div>
      ))}

      <div className="lib-editorial-grid__cell">
        <LibrarySuggestCard />
      </div>
    </div>
  );
}
