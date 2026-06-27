"use client";

import { PlayAudioButton } from "@/components/audio/play-audio-button";
import type { AudioResolveInput } from "@/lib/audio/types";

type VocabularyAudioButtonProps = {
  target: AudioResolveInput;
  label?: string;
};

export function VocabularyAudioButton({ target, label = "Écouter" }: VocabularyAudioButtonProps) {
  return (
    <PlayAudioButton
      target={target}
      label={label}
      className="vocabulary-audio focus-kb"
      iconClassName="vocabulary-audio__icon"
    />
  );
}
