import { Suspense } from "react";

import { ContextTranslationWorkspace } from "@/components/practice/context-translation-workspace";

export const metadata = {
  title: "Traduction contextualisée · Rossiyani",
  description: "Penser comme un locuteur natif — traduire, comprendre et apprendre.",
};

export default function ContextTranslationPage() {
  return (
    <Suspense fallback={null}>
      <ContextTranslationWorkspace />
    </Suspense>
  );
}
