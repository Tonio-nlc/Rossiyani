"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  buildVocabularyData,
  fetchWordEnrichment,
  mergeWordEnrichment,
  parseVocabularyTab,
  type VocabularyData,
  type VocabularyTab,
  vocabularyPath,
} from "@/lib/vocabulary";

import { VocabularyExpressionsPanel } from "./vocabulary-expressions-panel";
import { VocabularyHero } from "./vocabulary-hero";
import { VocabularyNav } from "./vocabulary-nav";
import { VocabularySentencesPanel } from "./vocabulary-sentences-panel";
import { VocabularyStatsRow } from "./vocabulary-stats";
import { VocabularyWordsPanel } from "./vocabulary-words-panel";

export function VocabularyHome() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState<VocabularyData | null>(null);
  const [enriching, setEnriching] = useState(false);

  const activeTab = parseVocabularyTab(searchParams.get("tab"));

  const hydrate = useCallback(async () => {
    const base = buildVocabularyData();
    setData(base);

    if (base.words.length === 0) {
      return;
    }

    setEnriching(true);
    const enrichment = await fetchWordEnrichment(
      base.words.map((word) => ({
        id: word.id,
        russian: word.russian,
        headword: word.headword,
      })),
    );
    setData({
      ...base,
      words: mergeWordEnrichment(base.words, enrichment),
    });
    setEnriching(false);
  }, []);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  const handleTabChange = (tab: VocabularyTab) => {
    router.replace(vocabularyPath(tab === "words" ? undefined : tab), { scroll: false });
  };

  if (!data) {
    return null;
  }

  return (
    <>
      <VocabularyHero />
      <section className="lessons-section lessons-section--compact">
        <VocabularyStatsRow stats={data.stats} />
      </section>
      <section className="lessons-section lessons-section--compact">
        <VocabularyNav active={activeTab} stats={data.stats} onChange={handleTabChange} />
      </section>

      {activeTab === "words" ? (
        <VocabularyWordsPanel words={data.words} loading={enriching} />
      ) : null}
      {activeTab === "expressions" ? (
        <VocabularyExpressionsPanel expressions={data.expressions} />
      ) : null}
      {activeTab === "sentences" ? (
        <VocabularySentencesPanel sentences={data.sentences} />
      ) : null}
    </>
  );
}
