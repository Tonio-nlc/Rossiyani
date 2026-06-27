import type { ComposeMode } from "./modes";

export function composePath(input?: {
  mode?: ComposeMode;
  textId?: string;
  exercise?: string;
  frenchPrompt?: string;
  reference?: string;
  context?: string;
}): string {
  const params = new URLSearchParams();
  if (input?.mode) {
    params.set("mode", input.mode);
  }
  if (input?.textId) {
    params.set("textId", input.textId);
  }
  if (input?.exercise) {
    params.set("exercise", input.exercise);
  }
  if (input?.frenchPrompt) {
    params.set("prompt", input.frenchPrompt);
  }
  if (input?.reference) {
    params.set("reference", input.reference);
  }
  if (input?.context) {
    params.set("context", input.context);
  }
  const query = params.toString();
  return query ? `/compose?${query}` : "/compose";
}
