"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  buildVocabularyData,
  parseVocabularyTab,
  type VocabularyData,
  type VocabularyTab,
  vocabularyPath,
} from "@/lib/vocabulary";

import { VocabularyExpressionsPanel } from "./vocabulary-expressions-panel";
import { VocabularyHero } from "./vocabulary-hero";
import { VocabularyNav } from "./vocabulary-nav";
import { VocabularySentencesPanel } from "./vocabulary-sentences-panel";
import { VocabularyWordsPanel } from "./vocabulary-words-panel";

export function VocabularyHome() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState<VocabularyData | null>(null);

  const activeTab = parseVocabularyTab(searchParams.get("tab"));

  const refresh = useCallback(() => {
    setData(buildVocabularyData());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleTabChange = (tab: VocabularyTab) => {
    router.replace(vocabularyPath(tab === "words" ? undefined : tab), { scroll: false });
  };

  if (!data) {
    return null;
  }

  return (
    <>
      <VocabularyHero stats={data.stats} />
      <VocabularyNav active={activeTab} stats={data.stats} onChange={handleTabChange} />

      {activeTab === "words" ? <VocabularyWordsPanel words={data.words} /> : null}
      {activeTab === "expressions" ? (
        <VocabularyExpressionsPanel expressions={data.expressions} />
      ) : null}
      {activeTab === "sentences" ? <VocabularySentencesPanel sentences={data.sentences} /> : null}
    </>
  );
}
