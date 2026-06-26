export type LessonContentBlock = {
  id: string;
  title: string;
  content: string;
};

function slugifyHeading(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

/** Split lesson markdown into intro + H2 sections for card-based layout. */
export function splitLessonContent(raw: string): {
  intro: string | null;
  blocks: LessonContentBlock[];
} {
  const normalized = raw.replace(/\r\n/g, "\n").trim();
  const sections = normalized.split(/\n(?=## )/);

  if (sections.length === 0) {
    return { intro: null, blocks: [] };
  }

  const first = sections[0] ?? "";
  const hasHeading = first.startsWith("## ");
  const intro = hasHeading ? null : first.trim() || null;
  const bodySections = hasHeading ? sections : sections.slice(1);

  const blocks = bodySections
    .map((section) => {
      const match = section.match(/^## (.+?)(?:\n|$)([\s\S]*)$/);
      if (!match) {
        return null;
      }
      const title = match[1]?.trim() ?? "Section";
      const content = match[2]?.trim() ?? "";
      return {
        id: slugifyHeading(title),
        title,
        content,
      };
    })
    .filter((block): block is LessonContentBlock => block !== null && block.content.length > 0);

  return { intro, blocks };
}
