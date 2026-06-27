"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { isAudioFallback } from "@/services/audio/types";

import { speakWithBrowser, stopBrowserSpeech } from "@/lib/audio/browser-speech";
import { fetchAudioResolve, prefetchAudioResolve } from "@/lib/audio/fetch-audio-resolve";
import {
  getPlaybackSpeedPreference,
  setPlaybackSpeedPreference,
} from "@/lib/audio/playback-speed-preference";
import { SPEED_OPTIONS, type PlaybackState, type TextPlaybackSession } from "@/lib/audio/types";

type AudioPlaybackContextValue = {
  state: PlaybackState;
  speed: number;
  activeSentenceId: string | null;
  textSession: TextPlaybackSession | null;
  setSpeed: (speed: number) => void;
  cycleSpeed: () => void;
  playWord: (wordId: string) => Promise<void>;
  playSentence: (sentenceId: string) => Promise<void>;
  playUtterance: (text: string, cacheKey?: string) => Promise<void>;
  playText: (sentenceIds: string[], startIndex?: number) => Promise<void>;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  togglePlayPause: () => void;
  seekSentenceIndex: (index: number) => void;
};

const AudioPlaybackContext = createContext<AudioPlaybackContextValue | null>(null);

export function useAudioPlayback(): AudioPlaybackContextValue {
  const value = useContext(AudioPlaybackContext);
  if (!value) {
    throw new Error("useAudioPlayback doit être utilisé dans AudioPlaybackProvider.");
  }
  return value;
}

export function AudioPlaybackProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const textSessionRef = useRef<TextPlaybackSession | null>(null);
  const playingRef = useRef(false);
  const speedRef = useRef(1);
  const playSentenceInternalRef = useRef<(sentenceId: string, fromTextSession: boolean) => Promise<void>>(
    async () => undefined,
  );

  const [state, setState] = useState<PlaybackState>("idle");
  const [speed, setSpeedState] = useState(1);
  const [activeSentenceId, setActiveSentenceId] = useState<string | null>(null);
  const [textSession, setTextSession] = useState<TextPlaybackSession | null>(null);

  const finishPlayback = useCallback(() => {
    playingRef.current = false;
    textSessionRef.current = null;
    setTextSession(null);
    setActiveSentenceId(null);
    setState("idle");
  }, []);

  const advanceTextSession = useCallback(() => {
    const session = textSessionRef.current;
    if (!session || !playingRef.current) {
      finishPlayback();
      return;
    }

    const nextIndex = session.currentIndex + 1;
    if (nextIndex >= session.sentenceIds.length) {
      finishPlayback();
      return;
    }

    const nextSession = { ...session, currentIndex: nextIndex };
    textSessionRef.current = nextSession;
    setTextSession(nextSession);
    void playSentenceInternalRef.current(session.sentenceIds[nextIndex]!, true);
  }, [finishPlayback]);

  const playResolved = useCallback(
    async (input: Parameters<typeof fetchAudioResolve>[0]) => {
      setState("loading");
      const result = await fetchAudioResolve(input);

      if (isAudioFallback(result)) {
        stopBrowserSpeech();
        audioRef.current?.pause();
        setState("playing");
        await speakWithBrowser(result.text, result.lang, speedRef.current);
        if (playingRef.current) {
          advanceTextSession();
        } else {
          setState("idle");
        }
        return;
      }

      const audio = audioRef.current;
      if (!audio) {
        return;
      }

      stopBrowserSpeech();
      audio.src = result.url;
      audio.playbackRate = speedRef.current;
      await audio.play();
      setState("playing");
    },
    [advanceTextSession],
  );

  const playSentenceInternal = useCallback(
    async (sentenceId: string, fromTextSession: boolean) => {
      setActiveSentenceId(sentenceId);
      const session = textSessionRef.current;
      if (session) {
        const nextIndex = session.sentenceIds.indexOf(sentenceId);
        if (nextIndex >= 0) {
          const nextSession = { ...session, currentIndex: nextIndex };
          textSessionRef.current = nextSession;
          setTextSession(nextSession);
        }
      }

      const lookahead = textSessionRef.current;
      if (lookahead) {
        const nextId = lookahead.sentenceIds[lookahead.currentIndex + 1];
        const nextNextId = lookahead.sentenceIds[lookahead.currentIndex + 2];
        if (nextId) {
          prefetchAudioResolve({ scope: "sentence", entityId: nextId });
        }
        if (nextNextId) {
          prefetchAudioResolve({ scope: "sentence", entityId: nextNextId });
        }
      }

      try {
        await playResolved({ scope: "sentence", entityId: sentenceId });
      } catch {
        if (!fromTextSession) {
          finishPlayback();
        }
      }
    },
    [finishPlayback, playResolved],
  );

  playSentenceInternalRef.current = playSentenceInternal;

  useEffect(() => {
    setSpeedState(getPlaybackSpeedPreference());
    speedRef.current = getPlaybackSpeedPreference();
    audioRef.current = new Audio();
    const audio = audioRef.current;

    const onEnded = () => {
      if (playingRef.current) {
        advanceTextSession();
        return;
      }
      setState("idle");
      setActiveSentenceId(null);
    };

    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("ended", onEnded);
      audio.pause();
      audioRef.current = null;
    };
  }, [advanceTextSession]);

  const setSpeed = useCallback((next: number) => {
    speedRef.current = next;
    setSpeedState(next);
    setPlaybackSpeedPreference(next);
    if (audioRef.current) {
      audioRef.current.playbackRate = next;
    }
  }, []);

  const cycleSpeed = useCallback(() => {
    const index = SPEED_OPTIONS.indexOf(speed as (typeof SPEED_OPTIONS)[number]);
    const next = SPEED_OPTIONS[(index + 1) % SPEED_OPTIONS.length];
    setSpeed(next);
  }, [setSpeed, speed]);

  const playWord = useCallback(
    async (wordId: string) => {
      playingRef.current = false;
      textSessionRef.current = null;
      setTextSession(null);
      setActiveSentenceId(null);
      stopBrowserSpeech();
      try {
        await playResolved({ scope: "word", entityId: wordId });
      } finally {
        if (!playingRef.current) {
          setState("idle");
        }
      }
    },
    [playResolved],
  );

  const playSentence = useCallback(
    async (sentenceId: string) => {
      playingRef.current = false;
      textSessionRef.current = null;
      setTextSession(null);
      stopBrowserSpeech();
      await playSentenceInternal(sentenceId, false);
      if (!playingRef.current) {
        setState("idle");
        setActiveSentenceId(null);
      }
    },
    [playSentenceInternal],
  );

  const playUtterance = useCallback(
    async (text: string, cacheKey?: string) => {
      playingRef.current = false;
      textSessionRef.current = null;
      setTextSession(null);
      setActiveSentenceId(null);
      stopBrowserSpeech();
      try {
        await playResolved({ scope: "utterance", text, cacheKey });
      } finally {
        setState("idle");
      }
    },
    [playResolved],
  );

  const playText = useCallback(
    async (sentenceIds: string[], startIndex = 0) => {
      if (sentenceIds.length === 0) {
        return;
      }
      const index = Math.min(Math.max(startIndex, 0), sentenceIds.length - 1);
      const session = { sentenceIds, currentIndex: index };
      textSessionRef.current = session;
      setTextSession(session);
      playingRef.current = true;
      stopBrowserSpeech();
      await playSentenceInternal(sentenceIds[index]!, true);
    },
    [playSentenceInternal],
  );

  const pause = useCallback(() => {
    if (audioRef.current && state === "playing") {
      audioRef.current.pause();
      setState("paused");
    }
    if (typeof window !== "undefined" && window.speechSynthesis?.speaking) {
      window.speechSynthesis.pause();
      setState("paused");
    }
  }, [state]);

  const resume = useCallback(() => {
    if (audioRef.current && state === "paused") {
      void audioRef.current.play();
      setState("playing");
    }
    if (typeof window !== "undefined" && window.speechSynthesis?.paused) {
      window.speechSynthesis.resume();
      setState("playing");
    }
  }, [state]);

  const stop = useCallback(() => {
    stopBrowserSpeech();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    finishPlayback();
  }, [finishPlayback]);

  const togglePlayPause = useCallback(() => {
    if (state === "playing") {
      pause();
      return;
    }
    if (state === "paused") {
      resume();
      return;
    }
    const session = textSessionRef.current;
    if (session) {
      void playText(session.sentenceIds, session.currentIndex);
    }
  }, [pause, playText, resume, state]);

  const seekSentenceIndex = useCallback(
    (index: number) => {
      const session = textSessionRef.current;
      if (!session) {
        return;
      }
      playingRef.current = true;
      void playText(session.sentenceIds, index);
    },
    [playText],
  );

  const value = useMemo(
    () => ({
      state,
      speed,
      activeSentenceId,
      textSession,
      setSpeed,
      cycleSpeed,
      playWord,
      playSentence,
      playUtterance,
      playText,
      pause,
      resume,
      stop,
      togglePlayPause,
      seekSentenceIndex,
    }),
    [
      activeSentenceId,
      cycleSpeed,
      pause,
      playSentence,
      playText,
      playUtterance,
      playWord,
      resume,
      seekSentenceIndex,
      setSpeed,
      speed,
      state,
      stop,
      textSession,
      togglePlayPause,
    ],
  );

  return <AudioPlaybackContext.Provider value={value}>{children}</AudioPlaybackContext.Provider>;
}
