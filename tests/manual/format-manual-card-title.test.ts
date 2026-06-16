import { describe, expect, it } from "vitest";

import { formatManualCardTitle } from "@/lib/manual/manual-card-layout";

describe("formatManualCardTitle", () => {
  it("splits French and Russian on colon", () => {
    expect(formatManualCardTitle("Se lever : вставать / встать")).toEqual({
      primary: "Se lever",
      secondary: "вставать · встать",
    });
  });

  it("splits comma-separated Russian forms", () => {
    expect(formatManualCardTitle("Voir et entendre : видеть, слышать")).toEqual({
      primary: "Voir et entendre",
      secondary: "видеть · слышать",
    });
  });

  it("keeps monolingual titles intact", () => {
    expect(formatManualCardTitle("Dire l'heure")).toEqual({
      primary: "Dire l'heure",
      secondary: null,
    });
  });
});
