import { Suspense } from "react";

import { VocabularyHome } from "@/components/vocabulary";

export default function VocabularyPage() {
  return (
    <Suspense fallback={null}>
      <VocabularyHome />
    </Suspense>
  );
}
