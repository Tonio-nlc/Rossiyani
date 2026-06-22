import type { HomeJournalData } from "@/features/home";
import type { TextListItem } from "@/features/texts";

import { HomeLanding } from "./home-landing";
import { HomeSessionContinuation } from "./home-session-continuation";

type HomeViewProps = {
  journal: HomeJournalData;
  texts: TextListItem[];
};

export function HomeView({ journal, texts }: HomeViewProps) {
  return (
    <>
      <HomeLanding />
      <HomeSessionContinuation journal={journal} texts={texts} />
    </>
  );
}
