"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { GhostButton } from "@/components/design-system";
import { useToast } from "@/components/ui/toast-provider";
import { getSavedSentences, saveSentence } from "@/lib/phrase-mining";
import { practicePath } from "@/lib/practice/constants";

type ReaderSentenceSidebarProps = {
  sentenceText: string;
  translation: string;
  textId: string;
  textTitle: string;
  collection: string;
};

export function ReaderSentenceSidebar({
  sentenceText,
  translation,
  textId,
  textTitle,
  collection,
}: ReaderSentenceSidebarProps) {
  const { toast } = useToast();
  const [saved, setSaved] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    const existing = getSavedSentences().find(
      (sentence) => sentence.text === sentenceText && sentence.sourceTextId === textId,
    );
    setSaved(Boolean(existing));
    setSavedId(existing?.id ?? null);
    setJustSaved(false);
  }, [sentenceText, textId]);

  const practiceHref = practicePath({
    savedSentenceId: savedId ?? undefined,
    reference: sentenceText,
    context: `From: ${textTitle}`,
    textId,
    textTitle,
    from: "reader",
    text: sentenceText,
  });

  const handleSave = () => {
    if (saved) {
      return;
    }

    const entry = saveSentence({
      text: sentenceText,
      translation,
      sourceTextId: textId,
      sourceTextTitle: textTitle,
      collection,
    });
    setSaved(true);
    setSavedId(entry.id);
    setJustSaved(true);
    toast("Phrase enregistrée", "success");
  };

  return (
    <section className="reader-sentence-sidebar" aria-label="Actions sur la phrase">
      <div className="reader-sentence-sidebar__actions">
        <button
          type="button"
          onClick={handleSave}
          disabled={saved}
          className={[
            "reader-sentence-sidebar__save focus-kb",
            saved ? "reader-sentence-sidebar__save--saved" : "",
            justSaved ? "reader-sentence-sidebar__save--confirmed" : "",
          ].join(" ")}
        >
          {saved ? (justSaved ? "✓ Phrase enregistrée" : "Enregistrée") : "Enregistrer la phrase"}
        </button>
        <Link href={practiceHref} className="reader-sentence-sidebar__link focus-kb">
          Pratiquer →
        </Link>
        <Link
          href="/vocabulary"
          className="reader-sentence-sidebar__link focus-kb"
        >
          Explorer →
        </Link>
        {saved ? (
          <GhostButton href="/library?section=phrases">Voir dans Mes phrases →</GhostButton>
        ) : null}
      </div>
    </section>
  );
}
