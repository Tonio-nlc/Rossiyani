import { describe, expect, it } from "vitest";

import { validateEditorialStyle } from "@/features/manual/editorial-lint";
import { validateLessonSections } from "@/features/manual/parse-lesson";

const validLessonBody = `
## Pourquoi le génitif change la forme du nom

Le mot change parce que le russe indique un lien de propriété ou d'absence.

────────────────────────

Pourquoi ?

Après **нет**, le russe ne garde pas le nominatif.

**нет времени** — Il n'y a pas de temps.

────────────────────────

Erreur fréquente

❌ **нет время**

✅ **нет времени**

────────────────────────

À retenir

**нет** + génitif = absence.

────────────────────────

────────────────────────

Pour aller un peu plus loin

- [Le génitif au singulier](/manual/lecons/genitif-singulier)

────────────────────────
`;

const v4AsciiSchema = `
Direction

куда ?
↓
в + accusatif
↓
в школу
`;

describe("validateEditorialStyle", () => {
  it("accepts V3/V4 lessons with Cyrillic and error markers", () => {
    const content = `${validLessonBody}\nExemple : **нет воды**.`;
    expect(validateEditorialStyle(content).valid).toBe(true);
  });

  it("accepts ASCII schemas with arrows (V4)", () => {
    const content = `${validLessonBody}\n${v4AsciiSchema}\n**в школу** — à l'école.`;
    expect(validateEditorialStyle(content).valid).toBe(true);
  });

  it("rejects academic phrasing", () => {
    const content = `
Le génitif exprime la possession.
${validLessonBody}
`;
    expect(validateEditorialStyle(content).valid).toBe(false);
  });
});

describe("validateLessonSections V4 box titles", () => {
  it("accepts 🧠 À retenir as À retenir", () => {
    const content = validLessonBody.replace("À retenir", "🧠 À retenir");
    expect(validateLessonSections(content).valid).toBe(true);
  });
});
