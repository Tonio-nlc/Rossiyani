import type { ConceptKnowledge } from "@/types/knowledge-graph";
import type { LemmaKnowledge } from "@/types/knowledge-graph";
import type { ExplorerEntityPageData } from "@/features/explorer/entity/types";
import { splitEditorialParagraphs } from "@/features/explorer/entity/types";

function firstParagraph(text: string): string {
  const parts = splitEditorialParagraphs(text);
  return parts[0] ?? text.trim();
}

export function tutorWhyFromEntity(data: ExplorerEntityPageData): string {
  if (data.whyItMatters?.trim()) {
    return data.whyItMatters;
  }

  const type = data.typeLabel.toLowerCase();
  return `Maîtriser ${data.label} vous permet de comprendre le russe authentique — c'est un ${type} que vous retrouverez dans vos lectures et que les locuteurs emploient naturellement.`;
}

export function tutorWhyFromLemma(knowledge: LemmaKnowledge): string {
  if (knowledge.simpleExplanation?.trim()) {
    return firstParagraph(knowledge.simpleExplanation);
  }

  if (knowledge.primaryTranslation?.trim()) {
    return `Connaître ${knowledge.lemma} (« ${knowledge.primaryTranslation} ») enrichit votre vocabulaire actif et rend vos lectures plus fluides.`;
  }

  return `${knowledge.lemma} revient souvent dans les textes russes — l'apprendre maintenant accélère chaque lecture suivante.`;
}

export function tutorWhyFromConcept(
  concept: ConceptKnowledge,
  grammaticalQuestion: string | null,
): string {
  if (concept.concept.frenchComparison?.trim()) {
    return firstParagraph(concept.concept.frenchComparison);
  }

  if (grammaticalQuestion) {
    return `Comprendre ce point — « ${grammaticalQuestion} » — débloque des phrases que le français ne construit pas de la même façon.`;
  }

  if (concept.concept.canonicalExplanation?.trim()) {
    return firstParagraph(concept.concept.canonicalExplanation);
  }

  return `Ce concept clarifie une zone où le russe diverge du français — utile dès votre prochaine lecture.`;
}

export function tutorWhyFromCase(titleFr: string, frenchContrast: string | null): string {
  if (frenchContrast?.trim()) {
    return firstParagraph(frenchContrast);
  }

  return `Le ${titleFr.toLowerCase()} structure des phrases entières en russe — le reconnaître rend chaque texte plus lisible.`;
}

export function tutorWhyFromEnding(
  endingLabel: string,
  caseQuestion: string | null,
): string {
  if (caseQuestion) {
    return `La terminaison ${endingLabel} signale souvent : « ${caseQuestion} » — repérer ce motif accélère la compréhension à la lecture.`;
  }

  return `Les terminaisons comme ${endingLabel} sont des indices visuels en russe — les reconnaître évite de bloquer sur chaque mot.`;
}

export function tutorSimpleExplanationFromEntity(data: ExplorerEntityPageData): string {
  const parts = [data.description, data.usageNotes].filter(Boolean);
  return parts.join("\n\n").trim();
}

export function tutorSimpleExplanationFromLemma(knowledge: LemmaKnowledge): string {
  const parts = [
    knowledge.primaryTranslation,
    knowledge.simpleExplanation,
    knowledge.secondaryTranslations.length > 0
      ? `Autres sens : ${knowledge.secondaryTranslations.join(" · ")}`
      : null,
  ].filter(Boolean);

  return parts.join("\n\n").trim();
}

export function tutorSimpleExplanationFromConcept(concept: ConceptKnowledge): string {
  const parts = [concept.concept.canonicalExplanation, concept.concept.frenchComparison].filter(
    Boolean,
  );
  return parts.join("\n\n").trim();
}
