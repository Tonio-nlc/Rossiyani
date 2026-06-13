import { analyzePastedText } from "@/lib/import-client";

export type ImportFailureCheck = {
  ok: boolean;
  label: string;
};

export type ImportFailureDetails = {
  headline: string;
  checks: ImportFailureCheck[];
  failedStep: string;
  technicalMessage: string;
  suggestions: string[];
};

type ImportFailureContext = {
  rawText: string;
  estimatedSentences: number;
  fileName?: string;
  fromPaste?: boolean;
};

const ANALYSIS_FAILURE =
  /aucune phrase n'a pu être analysée|aucune analyse valide/i;
const NO_SENTENCES = /aucune phrase détectée/i;

export function formatImportFailure(
  context: ImportFailureContext,
  errorMessage: string,
): ImportFailureDetails {
  const stats = analyzePastedText(context.rawText);
  const loadedLabel = context.fromPaste ? "Texte chargé" : "Fichier chargé";
  const checks: ImportFailureCheck[] = [
    { ok: context.rawText.trim().length > 0, label: loadedLabel },
    {
      ok: stats.characters > 0,
      label: `${stats.characters.toLocaleString("fr-FR")} caractères détectés`,
    },
    {
      ok: stats.estimatedSentences > 0,
      label: `${stats.estimatedSentences} phrase${stats.estimatedSentences > 1 ? "s" : ""} détectée${stats.estimatedSentences > 1 ? "s" : ""}`,
    },
  ];

  let failedStep = "Import";
  let headline = "L'import n'a pas abouti.";
  let suggestions = defaultSuggestions(context.fromPaste ?? false);

  if (NO_SENTENCES.test(errorMessage)) {
    checks.push({ ok: false, label: "Segmentation du texte" });
    failedStep = "Segmentation du texte";
    headline =
      "Le contenu a été chargé mais aucune phrase n'a pu être extraire du texte.";
    suggestions = [
      "Vérifiez que le texte contient des phrases complètes (points, !, ?).",
      "Supprimez les lignes vides ou les en-têtes sans contenu russe.",
      "Utilisez Coller du texte pour un contrôle direct du contenu.",
    ];
  } else if (ANALYSIS_FAILURE.test(errorMessage)) {
    checks.push({ ok: false, label: "Analyse des phrases" });
    failedStep = "Analyse des phrases";
    headline = `Le texte contient bien ${stats.estimatedSentences} phrase${stats.estimatedSentences > 1 ? "s" : ""} mais aucune analyse valide n'a été produite.`;
    suggestions = [
      "Vérifiez l'encodage du fichier (UTF-8 recommandé).",
      "Importez un fichier .txt UTF-8 sans caractères corrompus.",
      "Utilisez Coller du texte pour tester un extrait plus court.",
    ];
  } else if (/réseau|network|fetch/i.test(errorMessage)) {
    checks.push({ ok: false, label: "Connexion au serveur" });
    failedStep = "Connexion au serveur";
    headline = "Impossible de joindre le serveur d'import.";
    suggestions = [
      "Vérifiez votre connexion internet.",
      "Réessayez dans quelques instants.",
    ];
  } else if (/non autorisé|401/i.test(errorMessage)) {
    checks.push({ ok: false, label: "Authentification" });
    failedStep = "Authentification";
    headline = "Accès refusé à l'import.";
    suggestions = ["Vérifiez la clé administrateur dans les paramètres."];
  } else {
    checks.push({ ok: false, label: failedStep });
    headline = context.fileName
      ? `L'import de « ${context.fileName} » a échoué.`
      : "L'import a échoué.";
  }

  return {
    headline,
    checks,
    failedStep,
    technicalMessage: errorMessage,
    suggestions,
  };
}

function defaultSuggestions(fromPaste: boolean): string[] {
  if (fromPaste) {
    return [
      "Vérifiez que le texte est bien en russe (cyrillique).",
      "Essayez un extrait plus court pour isoler le problème.",
    ];
  }
  return [
    "Vérifiez l'encodage du fichier (UTF-8).",
    "Utilisez Coller du texte pour tester le même contenu.",
  ];
}
