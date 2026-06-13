/**
 * One-off migration: V1 (12 sections) → V2 (10 sections).
 * Run: npx tsx scripts/migrate-manual-v2.ts
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.join(process.cwd(), "content/manual/a1");

function splitSections(body: string): Map<string, string> {
  const map = new Map<string, string>();
  const parts = body.split(/^##\s+\d+\.\s+/m).slice(1);
  const titles = [...body.matchAll(/^##\s+\d+\.\s+(.+)$/gm)].map((m) => m[1]!.trim());

  titles.forEach((title, i) => {
    map.set(title, parts[i]?.trim() ?? "");
  });
  return map;
}

function extractDialogue(...texts: string[]): string {
  const lines: string[] = [];
  for (const text of texts) {
    for (const line of text.split("\n")) {
      if (/^[\s]*[—–-]\s*\p{Script=Cyrillic}/u.test(line)) {
        lines.push(line.trim());
      }
    }
  }
  const unique = [...new Set(lines)].slice(0, 6);
  if (unique.length < 2) {
    return "— Привет!\n\n— Здравствуйте!\n\n*Traduction :* — Salut ! / — Bonjour (formel).\n\n*Analyse :* échange minimal en registre familier vs poli.";
  }
  return unique.join("\n\n") + "\n\n*Traduction et analyse :* voir les répliques ci-dessus dans leur contexte.";
}

function migrate(body: string): string {
  const s = splitSections(body);

  const errors = [s.get("Comment un francophone pense"), s.get("Erreurs fréquentes")]
    .filter(Boolean)
    .join("\n\n");

  const summary = [s.get("Résumé"), s.get("À retenir")].filter(Boolean).join("\n\n");

  const dialogue = extractDialogue(
    s.get("Situation réelle") ?? "",
    s.get("Communication réelle") ?? "",
  );

  const sections: [number, string, string][] = [
    [1, "Pourquoi cette notion existe", s.get("Situation réelle") ?? ""],
    [2, "L'intuition", s.get("Intuition") ?? ""],
    [3, "La règle", s.get("La règle") ?? ""],
    [4, "Exemples progressifs", s.get("Exemples progressifs") ?? ""],
    [5, "Erreurs fréquentes", errors],
    [6, "Exceptions utiles", s.get("Exceptions utiles") ?? ""],
    [7, "Communication réelle", s.get("Communication réelle") ?? ""],
    [8, "Mini dialogue", dialogue],
    [9, "Résumé", summary],
    [10, "Pour aller plus loin", s.get("Pour aller plus loin") ?? ""],
  ];

  return sections.map(([n, title, content]) => `## ${n}. ${title}\n\n${content}`).join("\n\n");
}

const files = fs.readdirSync(ROOT).filter((f) => f.endsWith(".md") && !f.startsWith("_"));

for (const file of files) {
  const fp = path.join(ROOT, file);
  const raw = fs.readFileSync(fp, "utf8");
  const fmEnd = raw.indexOf("---", 3);
  const frontmatter = raw.slice(0, fmEnd + 3);
  const body = raw.slice(fmEnd + 3).trim();
  if (body.includes("Pourquoi cette notion existe")) {
    console.log(`skip (already V2): ${file}`);
    continue;
  }
  const migrated = migrate(body);
  fs.writeFileSync(fp, `${frontmatter}\n\n${migrated}\n`);
  console.log(`migrated: ${file}`);
}

console.log("Done.");
