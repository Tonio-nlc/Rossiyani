export const TEXT_TITLE_MAX_LENGTH = 100;

export function validateTextTitle(
  raw: string,
): { ok: true; title: string } | { ok: false; error: string } {
  const title = raw.trim();
  if (!title) {
    return { ok: false, error: "Le titre est obligatoire." };
  }
  if (title.length > TEXT_TITLE_MAX_LENGTH) {
    return {
      ok: false,
      error: `Le titre ne peut pas dépasser ${TEXT_TITLE_MAX_LENGTH} caractères.`,
    };
  }
  return { ok: true, title };
}
