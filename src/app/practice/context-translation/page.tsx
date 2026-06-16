import { Suspense } from "react";

import { ContextTranslationWorkspace } from "@/components/practice/context-translation-workspace";

export const metadata = {
  title: "Context Translation — Rossiyani",
  description: "Think like a native speaker. Translate, understand, compare and learn.",
};

export default function ContextTranslationPage() {
  return (
    <Suspense fallback={null}>
      <ContextTranslationWorkspace />
    </Suspense>
  );
}
