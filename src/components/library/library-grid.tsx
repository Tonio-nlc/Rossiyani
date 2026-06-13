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
        description="Importez votre premier texte russe pour commencer à lire avec le microscope linguistique."
        action={{ label: "Importer un texte", href: "/import" }}
      />
    );
  }

  if (texts.length === 0) {
    return (
      <EmptyState
        icon="🔍"
        title="Aucun texte ne correspond"
        description="Essayez d'autres mots-clés ou retirez les filtres actifs."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-[var(--layout-gap)] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {texts.map((text, index) => (
        <div
          key={text.id}
          className={[
            removingTextId === text.id ? "animate-fade-out" : "animate-fade-up",
          ].join(" ")}
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
