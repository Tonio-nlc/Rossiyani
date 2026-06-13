"use client";

import { useEffect, useState } from "react";

export function OfflineBanner() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  if (!offline) {
    return null;
  }

  return (
    <div
      role="status"
      className="border-b border-[var(--hairline)] bg-[var(--surface-secondary)] px-4 py-2 text-center text-xs text-[var(--ink-secondary)]"
    >
      Vous êtes hors ligne — la lecture locale reste disponible, l&apos;import et la recherche sont limités.
    </div>
  );
}
