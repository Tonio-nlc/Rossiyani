"use client";

import { useCallback, useState } from "react";

import { useAudioPlayback } from "./audio-playback-provider";
import type { AudioResolveInput } from "@/lib/audio/types";

type PlayAudioButtonProps = {
  target: AudioResolveInput;
  label?: string;
  className?: string;
  iconClassName?: string;
  disabled?: boolean;
};

export function PlayAudioButton({
  target,
  label = "Écouter",
  className = "reader-ws-audio-btn focus-kb",
  iconClassName = "reader-ws-audio-btn__icon",
  disabled = false,
}: PlayAudioButtonProps) {
  const { state, playWord, playSentence, playUtterance } = useAudioPlayback();
  const [pending, setPending] = useState(false);
  const busy = pending || state === "loading";

  const handleClick = useCallback(
    async (event: React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      if (disabled || busy) {
        return;
      }
      setPending(true);
      try {
        if (target.scope === "word") {
          await playWord(target.entityId);
        } else if (target.scope === "sentence") {
          await playSentence(target.entityId);
        } else {
          await playUtterance(target.text, target.cacheKey);
        }
      } finally {
        setPending(false);
      }
    },
    [busy, disabled, playSentence, playUtterance, playWord, target],
  );

  return (
    <button
      type="button"
      className={className}
      onClick={handleClick}
      disabled={disabled || busy}
      aria-label={label}
      title={label}
    >
      <svg viewBox="0 0 20 20" fill="none" aria-hidden className={iconClassName}>
        <path
          d="M10 4.5 6.5 7H4.5v6H6.5L10 15.5V4.5Z"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        <path
          d="M13.25 8.25a2.75 2.75 0 0 1 0 3.5M15.25 6.25a5.75 5.75 0 0 1 0 7.5"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
}
