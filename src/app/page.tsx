import type { Metadata } from "next";

import { HomeView } from "@/components/home";
import { getHomeJournalData } from "@/features/home";
import { listTexts } from "@/features/texts";

export const metadata: Metadata = {
  title: "Rossiyani — Your Russian learning workspace",
  description:
    "Continue reading, track your progress, and explore vocabulary from authentic Russian texts.",
};

export default async function HomePage() {
  const texts = await listTexts();
  const journal = await getHomeJournalData();

  return <HomeView journal={journal} texts={texts} />;
}
