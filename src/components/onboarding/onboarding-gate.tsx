"use client";

import { useEffect, useState } from "react";

import { isOnboardingComplete } from "@/lib/onboarding";

import { OnboardingFlow } from "./onboarding-flow";

type OnboardingGateProps = {
  texts: import("@/features/texts").TextListItem[];
};

/** @deprecated Use /onboarding route with OnboardingGuard instead. */
export function OnboardingGate({ texts }: OnboardingGateProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(!isOnboardingComplete());
  }, []);

  if (!show) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[90] overflow-y-auto bg-[var(--paper)]">
      <OnboardingFlow texts={texts} />
    </div>
  );
}
