"use client";

import Link from "next/link";

import {
  ReaderIconBookmark,
  ReaderIconButton,
  ReaderIconSearch,
  ReaderIconTextSize,
} from "./reader-icon-button";
import { ReaderTranslationMenu } from "./reader-translation-menu";
import type { TranslationDisplayMode } from "@/lib/reader/translation-display-preference";

type ReaderHeaderProps = {
  collectionName: string;
  title: string;
  level: string;
  estimatedMinutes: number;
  author?: string | null;
  percent: number;
  fontScale: number;
  bookmarked: boolean;
  translationMode: TranslationDisplayMode;
  interlinear: boolean;
  onFontScaleChange: (scale: number) => void;
  onBookmarkToggle: () => void;
  onOpenSearch: () => void;
  onTranslationModeChange: (mode: TranslationDisplayMode) => void;
  onInterlinearChange: (enabled: boolean) => void;
};

export function ReaderHeader({
  collectionName,
  title,
  level,
  estimatedMinutes,
  author = null,
  percent,
  fontScale,
  bookmarked,
  translationMode,
  interlinear,
  onFontScaleChange,
  onBookmarkToggle,
  onOpenSearch,
  onTranslationModeChange,
  onInterlinearChange,
}: ReaderHeaderProps) {
  const cycleFontScale = () => {
    const scales = [1, 1.125, 1.25];
    const index = scales.indexOf(fontScale);
    const next = scales[(index + 1) % scales.length];
    onFontScaleChange(next);
  };

  return (
    <header className="reader-ws-header">
      <nav className="reader-ws-header__breadcrumb" aria-label="Fil d'Ariane">
        <Link href="/library" className="reader-ws-header__crumb focus-kb">
          Bibliothèque
        </Link>
        <span className="reader-ws-header__crumb-sep" aria-hidden>
          /
        </span>
        <span className="reader-ws-header__crumb">{collectionName}</span>
        <span className="reader-ws-header__crumb-sep" aria-hidden>
          /
        </span>
        <span className="reader-ws-header__crumb reader-ws-header__crumb--current">{title}</span>
      </nav>

      <div className="reader-ws-header__row">
        <div className="reader-ws-header__copy">
          <h1 className="reader-ws-header__title break-russian">{title}</h1>
          <dl className="reader-ws-header__meta">
            {author ? (
              <div>
                <dt>Auteur</dt>
                <dd>{author}</dd>
              </div>
            ) : null}
            <div>
              <dt>Niveau</dt>
              <dd>{level}</dd>
            </div>
            <div>
              <dt>Temps de lecture</dt>
              <dd>{estimatedMinutes} min</dd>
            </div>
            <div>
              <dt>Progression</dt>
              <dd>{percent} %</dd>
            </div>
          </dl>
        </div>

        <div className="reader-ws-header__actions">
          <ReaderIconButton label="Rechercher dans le texte" onClick={onOpenSearch}>
            <ReaderIconSearch />
          </ReaderIconButton>
          <ReaderTranslationMenu
            mode={translationMode}
            interlinear={interlinear}
            onModeChange={onTranslationModeChange}
            onInterlinearChange={onInterlinearChange}
          />
          <ReaderIconButton label="Ajuster la taille du texte" onClick={cycleFontScale}>
            <ReaderIconTextSize />
          </ReaderIconButton>
          <ReaderIconButton
            label={bookmarked ? "Retirer le signet" : "Ajouter un signet"}
            onClick={onBookmarkToggle}
            active={bookmarked}
          >
            <ReaderIconBookmark filled={bookmarked} />
          </ReaderIconButton>
        </div>
      </div>

      <div className="reader-ws-header__progress" aria-hidden>
        <div className="reader-ws-header__progress-fill" style={{ width: `${percent}%` }} />
      </div>
    </header>
  );
}
