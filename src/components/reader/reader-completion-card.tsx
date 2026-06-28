"use client";

import Link from "next/link";
import { useMemo } from "react";

import type { ReadingSessionContinueAction } from "@/lib/reader/build-reading-session-summary";

type ReaderCompletionCardProps = {
  textTitle: string;
  continueActions: ReadingSessionContinueAction[];
};

type CompletionTile = {
  title: string;
  description: string;
  href: string;
  icon: "continue" | "library";
};

function CompletionIcon({ kind }: { kind: CompletionTile["icon"] }) {
  if (kind === "continue") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden className="reader-ws-complete__icon-svg">
        <path
          d="M6 5.5h12v13H6a1 1 0 0 1-1-1v-11a1 1 0 0 1 1-1Z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path d="M9 9h6M9 12h6M9 15h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="reader-ws-complete__icon-svg">
      <path
        d="M5 5.5h6v13H5a1 1 0 0 1-1-1v-11a1 1 0 0 1 1-1Zm9 0h5a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1h-6V5.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function buildTiles(actions: ReadingSessionContinueAction[]): CompletionTile[] {
  const [continueAction, libraryAction] = actions;

  return [
    {
      title: continueAction?.label ?? "Lire un autre texte",
      description: continueAction?.rationale ?? "Continuer à découvrir le russe en lisant",
      href: continueAction?.href ?? "/library",
      icon: "continue",
    },
    {
      title: libraryAction?.label ?? "Retourner à la bibliothèque",
      description: libraryAction?.rationale ?? "Revoir vos textes",
      href: libraryAction?.href ?? "/library",
      icon: "library",
    },
  ];
}

export function ReaderCompletionCard({ textTitle, continueActions }: ReaderCompletionCardProps) {
  const tiles = useMemo(() => buildTiles(continueActions), [continueActions]);

  return (
    <section className="reader-ws-complete" aria-labelledby="reader-ws-complete-heading">
      <div className="reader-ws-complete__head">
        <p className="reader-ws-complete__badge">
          <span className="reader-ws-complete__check" aria-hidden>
            ✓
          </span>
          Lecture terminée
        </p>
        <h2 id="reader-ws-complete-heading" className="reader-ws-complete__title break-russian">
          {textTitle}
        </h2>
        <p className="reader-ws-complete__lead">
          Vous avez lu ce texte jusqu&apos;au bout. La grammaire se construit en lisant — pas en
          suivant une leçon.
        </p>
      </div>

      <ul className="reader-ws-complete__grid reader-ws-complete__grid--two">
        {tiles.map((tile) => (
          <li key={tile.title}>
            <Link href={tile.href} className="reader-ws-complete__card focus-kb">
              <span className="reader-ws-complete__icon" aria-hidden>
                <CompletionIcon kind={tile.icon} />
              </span>
              <span className="reader-ws-complete__card-body">
                <span className="reader-ws-complete__card-title">{tile.title}</span>
                <span className="reader-ws-complete__card-copy">{tile.description}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
