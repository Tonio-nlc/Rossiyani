import type { Metadata } from "next";

import { HomeView } from "@/components/home";
import { getHomeJournalData } from "@/features/home";
import { listTexts } from "@/features/texts";

export const metadata: Metadata = {
  title: "Rossiyani — Read, understand and think in Russian",
  description:
    "A Russian learning system built around authentic content. Import texts, discover vocabulary and grammar, practice what you encounter.",
};

export default async function HomePage() {
  const texts = await listTexts();
  const journal = await getHomeJournalData();

  return <HomeView journal={journal} texts={texts} />;
}
