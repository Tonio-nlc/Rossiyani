"use client";

import { PlayAudioButton } from "@/components/audio/play-audio-button";

type SentenceListenButtonProps = {
  sentenceId: string;
};

export function SentenceListenButton({ sentenceId }: SentenceListenButtonProps) {
  return (
    <PlayAudioButton
      target={{ scope: "sentence", entityId: sentenceId }}
      label="Écouter la phrase"
      className="reader-ws-sentence-listen focus-kb"
      iconClassName="reader-ws-sentence-listen__icon"
    />
  );
}
