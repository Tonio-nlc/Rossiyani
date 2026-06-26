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

  return (
    <div className="lessons-grid lessons-grid--lessons ws-card-grid ws-card-grid--items library-ws-texts">
      {texts.map((text) => (
        <div
          key={text.id}
          className={["ws-card-grid__cell", removingTextId === text.id ? "animate-fade-out" : ""]
            .filter(Boolean)
            .join(" ")}
        >
          <LibraryTextCard
            text={text}
            disabled={busyTextId === text.id}
            onRename={onRename}
            onDelete={onDelete}
          />
        </div>
      ))}
      <div className="ws-card-grid__cell">
        <LibrarySuggestCard />
      </div>
    </div>
  );
}
