import { Suspense } from "react";

import { ComposeWorkspace } from "@/components/compose/compose-workspace";

import "../practice-workspace.css";
import "./compose-workspace.css";

export const metadata = {
  title: "Compose · Rossiyani",
  description:
    "Atelier d'écriture en russe : traduction, reformulation, rédaction libre et exercices après lecture.",
};

export default function ComposePage() {
  return (
    <Suspense fallback={null}>
      <ComposeWorkspace />
    </Suspense>
  );
}
