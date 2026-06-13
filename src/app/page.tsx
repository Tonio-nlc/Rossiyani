import type { Metadata } from "next";

import { HomeView } from "@/components/home";
import { getHomeJournalData } from "@/features/home";
import { listTexts } from "@/features/texts";

export const metadata: Metadata = {
  title: "Rossiyani",
  description: "A calm, editorial Russian language journal.",
};

export default async function HomePage() {
  const texts = await listTexts();
  const journal = await getHomeJournalData();

  return <HomeView journal={journal} texts={texts} />;
}
