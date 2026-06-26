"use client";

import { useEffect, useMemo, useState } from "react";

import { getExplorationHistory } from "@/lib/explorer/exploration-history";
import { buildHomeDashboardMetrics } from "@/lib/home/build-home-dashboard-metrics";
import { getLearningStreakSnapshot } from "@/lib/home/learning-streak";
import { getAllReadingProgress } from "@/lib/reader/reading-progress";
import { getSavedReaderWords } from "@/lib/reader/saved-words";

function formatMetric(value: number): string {
  return value.toLocaleString("fr-FR");
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "R";
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export function SettingsProfileHero() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  const { metrics, streak, displayName } = useMemo(() => {
    if (!ready) {
      return {
        metrics: {
          wordsExplored: 0,
          textsCompleted: 0,
          conceptsExplored: 0,
          currentStreak: 0,
        },
        streak: {
          currentStreak: 0,
          weeklyActivity: [false, false, false, false, false, false, false],
          wordsToday: 0,
        },
        displayName: "Apprenant",
      };
    }

    const exploration = getExplorationHistory();
    const streakSnapshot = getLearningStreakSnapshot(exploration);
    const metricsSnapshot = buildHomeDashboardMetrics({
      readingProgress: getAllReadingProgress(),
      exploration,
      savedWords: getSavedReaderWords(),
      streak: streakSnapshot,
    });

    const storedName =
      typeof window !== "undefined" ? window.localStorage.getItem("rossiyani:displayName") : null;

    return {
      metrics: metricsSnapshot,
      streak: streakSnapshot,
      displayName: storedName?.trim() || "Apprenant",
    };
  }, [ready]);

  return (
    <section className="settings-profile-hero" aria-label="Votre profil">
      <article className="settings-profile-identity">
        <span className="settings-profile-identity__avatar" aria-hidden>
          {initialsFromName(displayName)}
        </span>
        <h2 className="settings-profile-identity__name">{displayName}</h2>
        <p className="settings-profile-identity__meta">
          Votre espace d&apos;apprentissage du russe — progression, préférences et identité.
        </p>
      </article>

      <div className="settings-profile-stats">
        <article className="settings-profile-stat">
          <p className="settings-profile-stat__label">Série actuelle</p>
          <p className="settings-profile-stat__value settings-profile-stat__value--accent">
            {formatMetric(metrics.currentStreak)}
            <span className="settings-profile-stat__unit">jours</span>
          </p>
          <ul className="settings-profile-week" aria-label="Activité hebdomadaire">
            {streak.weeklyActivity.map((active, index) => (
              <li
                key={index}
                className={[
                  "settings-profile-week__day",
                  active ? "settings-profile-week__day--active" : "",
                ].join(" ")}
              />
            ))}
          </ul>
        </article>

        <article className="settings-profile-stat">
          <p className="settings-profile-stat__label">Mots explorés</p>
          <p className="settings-profile-stat__value">{formatMetric(metrics.wordsExplored)}</p>
        </article>

        <article className="settings-profile-stat">
          <p className="settings-profile-stat__label">Textes terminés</p>
          <p className="settings-profile-stat__value">{formatMetric(metrics.textsCompleted)}</p>
        </article>

        <article className="settings-profile-stat">
          <p className="settings-profile-stat__label">Aujourd&apos;hui</p>
          <p className="settings-profile-stat__value">
            {formatMetric(streak.wordsToday)}
            <span className="settings-profile-stat__unit">mots</span>
          </p>
        </article>
      </div>
    </section>
  );
}
