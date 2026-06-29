import { PlayAudioButton } from "@/components/audio/play-audio-button";
import { POS_LABELS_FR } from "@/features/grammar";
import type { ReaderWordSnapshot } from "@/lib/reader/build-minimal-word-detail";
import type { PartOfSpeech } from "@/types";

import { ReaderIconSave } from "./reader-icon-button";

type ReaderWordLookupStripProps = {
  snapshot: ReaderWordSnapshot;
  translation: string;
  partOfSpeechLabel: string | null;
  isSaved: boolean;
  onSave: () => void;
  compact?: boolean;
};

export function ReaderWordLookupStrip({
  snapshot,
  translation,
  partOfSpeechLabel,
  isSaved,
  onSave,
  compact = false,
}: ReaderWordLookupStripProps) {
  const pos =
    partOfSpeechLabel ??
    (snapshot.partOfSpeech
      ? (POS_LABELS_FR[snapshot.partOfSpeech as PartOfSpeech] ?? snapshot.partOfSpeech)
      : null);

  return (
    <footer
      className={[
        "reader-word-lookup",
        compact ? "reader-word-lookup--compact" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label="Traduction"
    >
      <div className="reader-word-lookup__row">
        <div className="reader-word-lookup__main">
          {!compact ? (
            <span className="reader-word-lookup__form break-russian">
              {snapshot.stressMarked || snapshot.original}
            </span>
          ) : null}
          <span className="reader-word-lookup__translation">{translation}</span>
          {pos ? <span className="reader-word-lookup__pos">{pos}</span> : null}
        </div>
        <PlayAudioButton
          target={{ scope: "word", entityId: snapshot.id }}
          label="Écouter"
          className="reader-word-lookup__audio focus-kb"
          iconClassName="reader-ws-icon-btn__svg"
        />
      </div>
      <button
        type="button"
        className="reader-word-lookup__save focus-kb"
        onClick={onSave}
        disabled={isSaved}
      >
        <ReaderIconSave />
        {isSaved ? "Enregistré" : "Enregistrer"}
      </button>
    </footer>
  );
}
