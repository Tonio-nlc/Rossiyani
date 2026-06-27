"use client";

import { useState } from "react";

import type { TextIntroduction } from "@/lib/reader/build-text-introduction";

type ReaderAboutTextProps = {
  introduction: TextIntroduction | null;
  defaultCollapsed?: boolean;
};

export function ReaderAboutText({
  introduction,
  defaultCollapsed = true,
}: ReaderAboutTextProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  if (!introduction) {
    return null;
  }

  const focusPoints = introduction.focusPoints.slice(0, 3);

  return (
    <section className="reader-ws-about">
      <button
        type="button"
        onClick={() => setCollapsed((value) => !value)}
        className="reader-ws-about__toggle focus-kb"
        aria-expanded={!collapsed}
      >
        <span className="reader-ws-about__label">À propos de ce texte</span>
        <span className="reader-ws-about__chevron" aria-hidden>
          {collapsed ? "▼" : "▲"}
        </span>
      </button>

      {!collapsed ? (
        <div className="reader-ws-about__body">
          {introduction.summary ? (
            <div>
              <p className="reader-ws-about__meta-label">Thème</p>
              <p className="reader-ws-about__copy">{introduction.summary}</p>
            </div>
          ) : null}

          {focusPoints.length > 0 ? (
            <div>
              <p className="reader-ws-about__meta-label">Vocabulaire clé</p>
              <ul className="reader-ws-about__list">
                {focusPoints.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <p className="reader-ws-about__meta-label">
            Temps de lecture estimé · {introduction.readMinutes} min
          </p>
        </div>
      ) : null}
    </section>
  );
}
