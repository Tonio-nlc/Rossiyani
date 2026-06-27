"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { isOnboardingComplete } from "@/lib/onboarding";

const EXEMPT_PREFIXES = [
  "/onboarding",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

export function OnboardingGuard() {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready || !pathname) {
      return;
    }
    if (EXEMPT_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
      return;
    }
    if (!isOnboardingComplete()) {
      router.replace("/onboarding");
    }
  }, [pathname, ready, router]);

  return null;
}
