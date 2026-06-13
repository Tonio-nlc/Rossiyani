import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { z } from "zod";

import { importRussianTextFeature } from "@/features/import";
import {
  buildImportDiagnostic,
  formatPipelineAuditReport,
  getPrimaryPipelineFailure,
  isImportDiagnosticsEnabled,
  logErrorObject,
  logImportError,
  logImportPhase,
  logZodValidationError,
} from "@/lib/diagnostics";

const importBodySchema = z.object({
  title: z.string().min(1),
  level: z.enum(["A1", "A2", "B1", "B2", "C1", "Native"]),
  source: z.string().optional(),
  rawText: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const adminSecret = process.env.ADMIN_SECRET;
    if (adminSecret) {
      const auth = request.headers.get("authorization");
      if (auth !== `Bearer ${adminSecret}`) {
        return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
      }
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch (parseBodyError) {
      logImportError("request.json", parseBodyError);
      return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
    }

    const parsed = importBodySchema.safeParse(body);
    if (!parsed.success) {
      logZodValidationError(parsed.error, { phase: "importBodySchema" });
      return NextResponse.json(
        { error: "Corps de requête invalide", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    logImportPhase("POST /api/admin/texts/import", {
      title: parsed.data.title,
      level: parsed.data.level,
      rawTextLength: parsed.data.rawText.length,
    });

    const result = await importRussianTextFeature(parsed.data);

    logImportPhase("POST /api/admin/texts/import success", { textId: result.textId });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const phase = "POST /api/admin/texts/import";
    logImportError(phase, error);
    logErrorObject(error);

    const message = error instanceof Error ? error.message : "Erreur d'import";
    const diagnostic = buildImportDiagnostic(phase, error);
    const pipelineAudit = formatPipelineAuditReport();
    const primaryFailure = getPrimaryPipelineFailure();

    if (error instanceof ZodError) {
      logZodValidationError(error, { phase });
    }

    return NextResponse.json(
      {
        error: message,
        pipelineAudit,
        primaryFailure: primaryFailure
          ? {
              step: primaryFailure.step,
              location: primaryFailure.location,
              message: primaryFailure.error?.message,
            }
          : undefined,
        ...(isImportDiagnosticsEnabled() && diagnostic ? { diagnostic } : {}),
      },
      { status: 500 },
    );
  }
}
