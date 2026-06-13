import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

const LOG_PREFIX = "[rossiyani:import]";

export function isImportDiagnosticsEnabled(): boolean {
  return process.env.NODE_ENV === "development";
}

export function logImportPhase(phase: string, detail?: Record<string, unknown>): void {
  if (detail) {
    console.error(LOG_PREFIX, phase, JSON.stringify(detail, null, 2));
  } else {
    console.error(LOG_PREFIX, phase);
  }
}

export function logImportError(
  phase: string,
  error: unknown,
  context?: Record<string, unknown>,
): void {
  console.error(LOG_PREFIX, `ERROR @ ${phase}`);
  if (context) {
    console.error(LOG_PREFIX, "context:", JSON.stringify(context, null, 2));
  }
  logErrorObject(error);
}

export function logErrorObject(error: unknown): void {
  if (error instanceof Error) {
    console.error(LOG_PREFIX, "error.name:", error.name);
    console.error(LOG_PREFIX, "error.message:", error.message);
    console.error(LOG_PREFIX, "error.stack:", error.stack);
    const cause = (error as Error & { cause?: unknown }).cause;
    if (cause !== undefined) {
      console.error(LOG_PREFIX, "error.cause:", cause);
    }
  } else {
    console.error(LOG_PREFIX, "error (non-Error):", error);
  }
  try {
    console.error(LOG_PREFIX, "error (serialized):", JSON.stringify(error, null, 2));
  } catch {
    console.error(LOG_PREFIX, "error (serialized): [unserializable]");
  }
}

export function logProviderRawResponse(
  provider: string,
  raw: string,
  context?: Record<string, unknown>,
): void {
  console.error(LOG_PREFIX, `${provider} raw response (before JSON parse)`);
  if (context) {
    console.error(LOG_PREFIX, "context:", JSON.stringify(context, null, 2));
  }
  console.error(LOG_PREFIX, raw);
}

export function logProviderHttpResponse(provider: string, status: number, body: string): void {
  console.error(LOG_PREFIX, `${provider} HTTP response`, { status, body });
}

export function logParsedJsonBeforeZod(parsed: unknown, context?: Record<string, unknown>): void {
  console.error(LOG_PREFIX, "parsed JSON (before Zod validation)");
  if (context) {
    console.error(LOG_PREFIX, "context:", JSON.stringify(context, null, 2));
  }
  console.error(LOG_PREFIX, JSON.stringify(parsed, null, 2));
}

export function logZodValidationError(error: ZodError, context?: Record<string, unknown>): void {
  console.error(LOG_PREFIX, "Zod validation failed");
  if (context) {
    console.error(LOG_PREFIX, "context:", JSON.stringify(context, null, 2));
  }
  console.error(LOG_PREFIX, "zod.flatten():", JSON.stringify(error.flatten(), null, 2));
  console.error(LOG_PREFIX, "zod.format():", JSON.stringify(error.format(), null, 2));
  console.error(LOG_PREFIX, "zod.issues:", JSON.stringify(error.issues, null, 2));
}

export function logPrismaError(phase: string, error: unknown, context?: Record<string, unknown>): void {
  console.error(LOG_PREFIX, `Prisma error @ ${phase}`);
  if (context) {
    console.error(LOG_PREFIX, "context:", JSON.stringify(context, null, 2));
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    console.error(LOG_PREFIX, "prisma.code:", error.code);
    console.error(LOG_PREFIX, "prisma.meta:", JSON.stringify(error.meta, null, 2));
    console.error(LOG_PREFIX, "prisma.message:", error.message);
    console.error(LOG_PREFIX, "prisma.clientVersion:", error.clientVersion);
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    console.error(LOG_PREFIX, "prisma.validation:", error.message);
  } else {
    logErrorObject(error);
  }
}

export type ImportDiagnosticPayload = {
  phase: string;
  message: string;
  stack?: string;
  zod?: ReturnType<ZodError["flatten"]>;
  prisma?: { code: string; meta: unknown };
  context?: Record<string, unknown>;
};

export function buildImportDiagnostic(
  phase: string,
  error: unknown,
  context?: Record<string, unknown>,
): ImportDiagnosticPayload | undefined {
  if (!isImportDiagnosticsEnabled()) {
    return undefined;
  }

  const diagnostic: ImportDiagnosticPayload = {
    phase,
    message: error instanceof Error ? error.message : String(error),
    context,
  };

  if (error instanceof Error && error.stack) {
    diagnostic.stack = error.stack;
  }

  if (error instanceof ZodError) {
    diagnostic.zod = error.flatten();
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    diagnostic.prisma = { code: error.code, meta: error.meta };
  }

  return diagnostic;
}
