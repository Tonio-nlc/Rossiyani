import type { Metadata } from "next";

import { HomeView } from "@/components/home";
import { getHomeJournalData } from "@/features/home";
import { listTexts } from "@/features/texts";

export const metadata: Metadata = {
  title: "Dashboard · Rossiyani",
  description: "Votre fil de session — lecture, exploration et pratique.",
};

export default async function HomePage() {
  const texts = await listTexts();
  const journal = await getHomeJournalData();

  return <HomeView journal={journal} texts={texts} />;
}
