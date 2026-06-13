import { Suspense } from "react";

import { PracticeWorkspace } from "@/components/compose/practice-workspace";

export const metadata = {
  title: "Practice — Rossiyani",
  description: "Express an idea in Russian and understand how a native would phrase it.",
};

export default function PracticePage() {
  return (
    <Suspense fallback={null}>
      <PracticeWorkspace />
    </Suspense>
  );
}
