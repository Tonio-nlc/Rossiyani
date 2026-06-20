import { EmptyState } from "@/components/ui/empty-state";
import type { TextListItem } from "@/features/texts";

import { LibraryCard } from "./library-card";

type LibraryGridProps = {
  texts: TextListItem[];
  hasAnyTexts: boolean;
  busyTextId?: string | null;
  removingTextId?: string | null;
  onRename: (text: TextListItem) => void;
  onDelete: (text: TextListItem) => void;
};

export function LibraryGrid({
  texts,
  hasAnyTexts,
  busyTextId = null,
  removingTextId = null,
  onRename,
  onDelete,
}: LibraryGridProps) {
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
    <div className="library-editorial-grid">
      {texts.map((text, index) => (
        <div
          key={text.id}
          className={removingTextId === text.id ? "animate-fade-out" : "animate-fade-up"}
          style={
            removingTextId === text.id
              ? undefined
              : { animationDelay: `${Math.min(index * 40, 320)}ms` }
          }
        >
          <LibraryCard
            text={text}
            disabled={busyTextId === text.id}
            onRename={onRename}
            onDelete={onDelete}
          />
        </div>
      ))}
    </div>
  );
}
