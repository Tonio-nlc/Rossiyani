/**
 * Backfills Text.collectionId from legacy Text.source values.
 *
 * Usage: npx tsx scripts/migrate-text-collections.ts
 */
import { prisma } from "@/lib/prisma";
import { resolveCollectionIdFromLegacySource } from "@/content/collections";

async function main() {
  const texts = await prisma.text.findMany({
    select: { id: true, title: true, source: true, collectionId: true },
  });

  let updated = 0;

  for (const text of texts) {
    const resolved = resolveCollectionIdFromLegacySource(text.source);
    const needsUpdate = text.collectionId !== resolved || (text.source && text.collectionId === "everyday-russian");

    if (text.collectionId === "everyday-russian" && text.source?.trim()) {
      await prisma.text.update({
        where: { id: text.id },
        data: { collectionId: resolved },
      });
      updated += 1;
      console.log(`Mapped "${text.title}" → ${resolved} (from: ${text.source})`);
      continue;
    }

    if (needsUpdate && text.collectionId !== resolved && !text.source) {
      await prisma.text.update({
        where: { id: text.id },
        data: { collectionId: resolved },
      });
      updated += 1;
    }
  }

  console.log(`Migration complete — ${updated} text(s) updated out of ${texts.length}.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
