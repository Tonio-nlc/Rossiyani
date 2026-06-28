import type { Metadata } from "next";

import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";
import { listTexts } from "@/features/texts/list-texts";

import "../onboarding-workspace.css";

export const metadata: Metadata = {
  title: "Bienvenue — Rossiyani",
  description: "Configurez votre parcours et commencez votre première lecture.",
};

export default async function OnboardingPage() {
  const texts = await listTexts();
  return <OnboardingFlow texts={texts} />;
}
