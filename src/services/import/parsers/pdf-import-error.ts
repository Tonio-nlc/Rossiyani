export class PdfImportError extends Error {
  readonly reason: string;
  readonly userMessage: string;

  constructor(reason: string, userMessage = "Ce PDF n'a pas pu être traité.") {
    super(userMessage);
    this.name = "PdfImportError";
    this.reason = reason;
    this.userMessage = userMessage;
  }
}

export function isPdfImportError(error: unknown): error is PdfImportError {
  return error instanceof PdfImportError;
}
