"use client";

import Link from "next/link";

import {
  ReaderIconBookmark,
  ReaderIconButton,
  ReaderIconMore,
  ReaderIconSearch,
  ReaderIconTextSize,
} from "./reader-icon-button";

type ReaderHeaderProps = {
  collectionName: string;
  title: string;
  level: string;
  estimatedMinutes: number;
  author?: string | null;
  percent: number;
  fontScale: number;
  bookmarked: boolean;
  onFontScaleChange: (scale: number) => void;
  onBookmarkToggle: () => void;
  onOpenSearch: () => void;
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
  onFontScaleChange,
  onBookmarkToggle,
  onOpenSearch,
}: ReaderHeaderProps) {
  const cycleFontScale = () => {
    const scales = [1, 1.125, 1.25];
    const index = scales.indexOf(fontScale);
    const next = scales[(index + 1) % scales.length];
    onFontScaleChange(next);
  };

  return (
    <header className="reader-ws-header">
      <nav className="reader-ws-header__breadcrumb" aria-label="Breadcrumb">
        <Link href="/library" className="reader-ws-header__crumb focus-kb">
          Library
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
                <dt>Author</dt>
                <dd>{author}</dd>
              </div>
            ) : null}
            <div>
              <dt>Level</dt>
              <dd>{level}</dd>
            </div>
            <div>
              <dt>Reading time</dt>
              <dd>{estimatedMinutes} min</dd>
            </div>
            <div>
              <dt>Progress</dt>
              <dd>{percent}%</dd>
            </div>
          </dl>
        </div>

        <div className="reader-ws-header__actions">
          <ReaderIconButton label="Search in text" onClick={onOpenSearch}>
            <ReaderIconSearch />
          </ReaderIconButton>
          <ReaderIconButton label="Adjust font size" onClick={cycleFontScale}>
            <ReaderIconTextSize />
          </ReaderIconButton>
          <ReaderIconButton
            label={bookmarked ? "Remove bookmark" : "Bookmark"}
            onClick={onBookmarkToggle}
            active={bookmarked}
          >
            <ReaderIconBookmark filled={bookmarked} />
          </ReaderIconButton>
          <ReaderIconButton label="More actions" onClick={() => undefined}>
            <ReaderIconMore />
          </ReaderIconButton>
        </div>
      </div>

      <div className="reader-ws-header__progress" aria-hidden>
        <div className="reader-ws-header__progress-fill" style={{ width: `${percent}%` }} />
      </div>
    </header>
  );
}
