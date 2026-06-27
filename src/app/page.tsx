import type { Metadata } from "next";

import { HomeView } from "@/components/home";
import { getHomeJournalData } from "@/features/home";
import { listTexts } from "@/features/texts";

export const metadata: Metadata = {
  title: "Rossiyani — Votre session de lecture",
  description:
    "Reprenez votre lecture, révisez vos mots et découvrez votre prochain texte en quelques secondes.",
};

export default async function HomePage() {
  const texts = await listTexts();
  const journal = await getHomeJournalData();

  return <HomeView journal={journal} texts={texts} />;
}
