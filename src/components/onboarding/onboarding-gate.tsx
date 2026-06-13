"use client";

import { useEffect, useState } from "react";

import { isOnboardingComplete } from "@/lib/onboarding";

import { OnboardingFlow } from "./onboarding-flow";

export function OnboardingGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    setShowOnboarding(!isOnboardingComplete());
    setReady(true);
  }, []);

  useEffect(() => {
    if (showOnboarding) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
    return () => document.body.classList.remove("modal-open");
  }, [showOnboarding]);

  if (!ready) {
    return <>{children}</>;
  }

  return (
    <>
      <div
        aria-hidden={showOnboarding}
        className={showOnboarding ? "pointer-events-none select-none" : undefined}
      >
        {children}
      </div>
      {showOnboarding ? (
        <OnboardingFlow onComplete={() => setShowOnboarding(false)} />
      ) : null}
    </>
  );
}
