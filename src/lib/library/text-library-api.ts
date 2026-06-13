import type { TextListItem } from "@/features/texts";

export class TextLibraryApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "TextLibraryApiError";
  }
}

async function parseError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { error?: string };
    return body.error ?? "Une erreur est survenue.";
  } catch {
    return "Une erreur est survenue.";
  }
}

export async function renameTextRequest(textId: string, title: string): Promise<TextListItem> {
  const response = await fetch(`/api/texts/${textId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });

  if (!response.ok) {
    throw new TextLibraryApiError(await parseError(response), response.status);
  }

  const body = (await response.json()) as { text: TextListItem };
  return body.text;
}

export async function deleteTextRequest(textId: string): Promise<void> {
  const response = await fetch(`/api/texts/${textId}`, { method: "DELETE" });

  if (!response.ok) {
    throw new TextLibraryApiError(await parseError(response), response.status);
  }
}
