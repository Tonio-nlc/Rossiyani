import { EmptyState } from "@/components/design-system";
import type { TextListItem } from "@/features/texts";

import { LibrarySuggestCard } from "./library-suggest-card";
import { LibraryTextCard } from "./library-text-card";

type LibraryWorkspaceTextGridProps = {
  texts: TextListItem[];
  hasAnyTexts: boolean;
  busyTextId?: string | null;
  removingTextId?: string | null;
  onRename: (text: TextListItem) => void;
  onDelete: (text: TextListItem) => void;
};

export function LibraryWorkspaceTextGrid({
  texts,
  hasAnyTexts,
  busyTextId = null,
  removingTextId = null,
  onRename,
  onDelete,
}: LibraryWorkspaceTextGridProps) {
  if (!hasAnyTexts) {
    return (
      <EmptyState
        eyebrow="Bibliothèque"
        title="Votre bibliothèque est vide"
        description="Importez un texte en russe pour commencer à lire et enrichir votre vocabulaire."
        action={{ label: "Importer un texte →", href: "/import" }}
      />
    );
  }

  if (texts.length === 0) {
    return (
      <EmptyState
        eyebrow="Bibliothèque"
        title="Aucun texte ne correspond"
        description="Modifiez les filtres pour élargir votre recherche."
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
