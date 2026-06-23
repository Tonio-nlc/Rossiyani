import type { HomeJournalData } from "@/features/home";
import type { TextListItem } from "@/features/texts";

import { HomeDashboard } from "./home-dashboard";

type HomeViewProps = {
  journal: HomeJournalData;
  texts: TextListItem[];
};

export function HomeView({ journal, texts }: HomeViewProps) {
  return <HomeDashboard journal={journal} texts={texts} />;
}
