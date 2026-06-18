import type { HomeJournalData } from "@/features/home";
import type { TextListItem } from "@/features/texts";

import { HomeSessionJournal } from "./home-session-journal";

type HomeViewProps = {
  journal: HomeJournalData;
  texts: TextListItem[];
};

export function HomeView({ journal, texts }: HomeViewProps) {
  return <HomeSessionJournal journal={journal} texts={texts} />;
}
