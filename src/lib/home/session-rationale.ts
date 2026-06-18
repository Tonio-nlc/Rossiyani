import type { TodaysDiscovery } from "@/features/discovery";
import type { HomeFeaturedLesson, HomeFeaturedPractice } from "@/features/home";

export function continueReadingRationale(
  textTitle: string,
  lastReadLabel: string | null,
  percent: number | null,
): string {
  if (lastReadLabel) {
    const progress = percent != null && percent > 0 ? ` · ${percent} %` : "";
    return `Basé sur le texte ${textTitle} — lu ${lastReadLabel.toLowerCase()}${progress}`;
  }

  return `Prochain texte de votre bibliothèque · ${textTitle}`;
}

export function todaysDiscoveryRationale(discovery: TodaysDiscovery): string {
  const topic = discovery.topics[0];
  if (topic) {
    return `Sélectionné pour votre session · ${discovery.typeLabel.toLowerCase()} · thème ${topic}`;
  }

  return `Sélectionné pour votre session · ${discovery.typeLabel} · ${discovery.difficulty}`;
}

export function todaysDiscoveryEmptyRationale(): string {
  return "Importez un texte pour alimenter votre graphe et débloquer des découvertes quotidiennes.";
}

export function reviewTodayRationale(seedLemma: string | undefined): string {
  if (seedLemma) {
    return `Pour réactiver ${seedLemma} et les mots associés dans votre graphe`;
  }

  return "Réactivation espacée · mots repérés dans votre bibliothèque";
}

export function recommendedPracticeRationale(
  practice: HomeFeaturedPractice,
  discovery: TodaysDiscovery | null,
): string {
  switch (practice.source) {
    case "discovery":
      return discovery
        ? `Prolonge la découverte · ${discovery.displayLabel}`
        : "Prolonge votre découverte du jour";
    case "related":
      return "Relié à vos explorations et révisions récentes";
    case "personalized":
      if (practice.title.toLowerCase().includes("reading")) {
        return "Inspiré par vos lectures récentes";
      }
      return "Basé sur le vocabulaire que vous explorez";
    case "editorial":
      return "Pour clôturer votre session avec une production écrite";
    default:
      return "Suite naturelle de votre session d'aujourd'hui";
  }
}

export function continueExploringExplorerRationale(discovery: TodaysDiscovery): string {
  return `Explorer ${discovery.displayLabel} dans le graphe de connaissances`;
}

export function continueExploringLessonRationale(
  lesson: HomeFeaturedLesson,
  discovery: TodaysDiscovery | null,
): string {
  if (discovery) {
    return `Approfondir · en lien avec ${discovery.displayLabel}`;
  }

  return `Suite logique · ${lesson.levelLabel} · ${lesson.readingMinutes} min de lecture`;
}
