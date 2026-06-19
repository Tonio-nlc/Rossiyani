import { Suspense } from "react";

import { PracticeWorkspace } from "@/components/compose/practice-workspace";

export const metadata = {
  title: "Pratique · Rossiyani",
  description: "Exprimer une idée en russe et comprendre comment un locuteur natif la formulerait.",
};

export default function PracticePage() {
  return (
    <Suspense fallback={null}>
      <PracticeWorkspace />
    </Suspense>
  );
}
