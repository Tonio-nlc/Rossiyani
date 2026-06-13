import { describe, expect, it } from "vitest";

import { formatImportFailure } from "@/lib/import-error-format";

describe("formatImportFailure", () => {
  const context = {
    rawText: "Первая фраза. Вторая фраза. ".repeat(9),
    estimatedSentences: 18,
    fileName: "hiver.txt",
    fromPaste: false,
  };

  it("explains analysis failure with sentence count and suggestions", () => {
    const details = formatImportFailure(
      context,
      "Import échoué : aucune phrase n'a pu être analysée et enregistrée.",
    );

    expect(details.headline).toContain("18 phrases");
    expect(details.checks.some((c) => c.ok && c.label.includes("Fichier chargé"))).toBe(true);
    expect(details.checks.some((c) => c.ok && c.label.includes("caractères"))).toBe(true);
    expect(details.checks.some((c) => c.ok && c.label.includes("18 phrases"))).toBe(true);
    expect(details.checks.some((c) => !c.ok && c.label.includes("Analyse"))).toBe(true);
    expect(details.suggestions.some((s) => s.includes("UTF-8"))).toBe(true);
  });

  it("labels paste imports as text loaded", () => {
    const details = formatImportFailure(
      { ...context, fromPaste: true, fileName: "texte-collé.txt" },
      "Erreur réseau",
    );

    expect(details.checks[0]?.label).toBe("Texte chargé");
    expect(details.failedStep).toBe("Connexion au serveur");
  });
});
