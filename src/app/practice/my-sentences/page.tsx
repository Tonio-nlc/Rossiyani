import { Suspense } from "react";

import { MySentencesPracticeHub } from "@/components/practice/my-sentences-practice-hub";

export const metadata = {
  title: "Mes phrases · Pratique · Rossiyani",
  description: "Pratiquez les phrases enregistrées depuis vos lectures.",
};

export default function MySentencesPracticePage() {
  return (
    <Suspense fallback={null}>
      <div className="practice-shell pb-8">
        <MySentencesPracticeHub />
      </div>
    </Suspense>
  );
}
