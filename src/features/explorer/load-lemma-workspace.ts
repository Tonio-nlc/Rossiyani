import type { PartOfSpeech } from "@prisma/client";

import {
  presentationFromEntity,
  presentationFromLemma,
  type ExplorerWordPresentation,
} from "@/components/explorer/explorer-word-presentation";
import { practicePath } from "@/lib/practice/constants";

import {
  buildEntityPageFromLemmaCurated,
  labelsEquivalent,
  resolveLemmaEntity,
} from "./entity";

export type LemmaWorkspaceData = {
  presentation: ExplorerWordPresentation;
  breadcrumb: Array<{ label: string; href?: string }>;
};

export type LemmaWorkspaceLoadResult =
  | { status: "not_found" }
  | { status: "redirect"; path: string }
  | { status: "ok"; data: LemmaWorkspaceData };

export async function loadLemmaWorkspace(
  lemma: string,
  preferredPos?: PartOfSpeech,
): Promise<LemmaWorkspaceLoadResult> {
  const resolved = await resolveLemmaEntity(lemma, preferredPos);

  if (!resolved) {
    return { status: "not_found" };
  }

  if (!labelsEquivalent(resolved.requestedLemma, resolved.canonicalLemma)) {
    return { status: "redirect", path: resolved.canonicalPath };
  }

  if (resolved.knowledge) {
    const knowledge = resolved.knowledge;
    const readExamplesHref = knowledge.examples[0]?.textId
      ? `/texts/${knowledge.examples[0].textId}`
      : null;

    return {
      status: "ok",
      data: {
        presentation: presentationFromLemma(knowledge, {
          practiceHref: practicePath({
            structure: knowledge.lemma,
            mode: "structure",
            from: "explorer",
          }),
          exploreHref: `/explorer?q=${encodeURIComponent(knowledge.lemma)}`,
          readExamplesHref,
        }),
        breadcrumb: [
          { label: "Explorer", href: "/explorer" },
          { label: "Lemmas", href: "/explorer/lemmas" },
          { label: knowledge.lemma },
        ],
      },
    };
  }

  if (resolved.curated) {
    const pageData = await buildEntityPageFromLemmaCurated(resolved.curated);

    return {
      status: "ok",
      data: {
        presentation: presentationFromEntity(pageData, {
          practiceHref: practicePath({
            structure: pageData.practiceStructure,
            mode: "structure",
            from: "explorer",
          }),
          readExamplesHref: pageData.relatedTexts[0]?.textId
            ? `/texts/${pageData.relatedTexts[0].textId}`
            : null,
        }),
        breadcrumb: pageData.breadcrumb,
      },
    };
  }

  return { status: "not_found" };
}
