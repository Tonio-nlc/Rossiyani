"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { writeLearningSignalsCookie } from "@/components/discovery/sync-learning-signals";
import {
  recordExploration,
  type ExplorationKind,
} from "@/lib/explorer/exploration-history";

import { conceptPath } from "./explorer-routes";

function trackPath(pathname: string): void {
  const conceptMatch = pathname.match(/^\/explorer\/concepts\/([^/]+)$/);
  if (conceptMatch) {
    const key = decodeURIComponent(conceptMatch[1]!);
    recordExploration({
      id: `concept:${key}`,
      label: key,
      href: conceptPath(key),
      kind: "concept",
    });
    return;
  }

  const lemmaMatch = pathname.match(/^\/explorer\/lemmas\/([^/]+)$/);
  if (lemmaMatch) {
    const lemma = decodeURIComponent(lemmaMatch[1]!);
    recordExploration({
      id: `lemma:${lemma}`,
      label: lemma,
      href: pathname,
      kind: "lemma",
    });
    return;
  }

  const endingMatch = pathname.match(/^\/explorer\/endings\/([^/]+)$/);
  if (endingMatch) {
    const ending = decodeURIComponent(endingMatch[1]!);
    recordExploration({
      id: `ending:${ending}`,
      label: `-${ending}`,
      href: pathname,
      kind: "ending",
    });
    return;
  }

  const caseMatch = pathname.match(/^\/explorer\/cases\/([^/]+)$/);
  if (caseMatch) {
    const caseKey = decodeURIComponent(caseMatch[1]!);
    recordExploration({
      id: `case:${caseKey}`,
      label: caseKey,
      href: pathname,
      kind: "case",
    });
    return;
  }

  const collocationMatch = pathname.match(/^\/explorer\/collocations\/([^/]+)$/);
  if (collocationMatch) {
    const label = decodeURIComponent(collocationMatch[1]!);
    recordExploration({
      id: `collocation:${label}`,
      label,
      href: pathname,
      kind: "phrase",
    });
    return;
  }

  const expressionMatch = pathname.match(/^\/explorer\/expressions\/([^/]+)$/);
  if (expressionMatch) {
    const label = decodeURIComponent(expressionMatch[1]!);
    recordExploration({
      id: `expression:${label}`,
      label,
      href: pathname,
      kind: "phrase",
    });
    return;
  }

  const textMatch = pathname.match(/^\/texts\/([^/]+)$/);
  if (textMatch) {
    recordExploration({
      id: `text:${textMatch[1]}`,
      label: "Texte en lecture",
      href: pathname,
      kind: "text",
    });
    return;
  }

  const browsePages: Array<{ prefix: string; label: string; kind: ExplorationKind }> = [
    { prefix: "/explorer/cases", label: "Cas", kind: "page" },
    { prefix: "/explorer/lemmas", label: "Lemmes", kind: "page" },
    { prefix: "/explorer/endings", label: "Terminaisons", kind: "page" },
    { prefix: "/explorer/concepts", label: "Concepts", kind: "page" },
    { prefix: "/explorer/collocations", label: "Collocations", kind: "page" },
    { prefix: "/explorer/expressions", label: "Expressions", kind: "page" },
  ];

  for (const page of browsePages) {
    if (pathname === page.prefix || pathname.startsWith(`${page.prefix}/`)) {
      recordExploration({
        id: `page:${page.prefix}`,
        label: page.label,
        href: page.prefix,
        kind: page.kind,
      });
      return;
    }
  }
}

export function ExplorerPathTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname.startsWith("/explorer") && !pathname.startsWith("/texts/")) {
      return;
    }
    trackPath(pathname);
    writeLearningSignalsCookie();
  }, [pathname]);

  return null;
}
