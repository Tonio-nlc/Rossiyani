import { after, NextResponse } from "next/server";
import { ZodError } from "zod";
import { z } from "zod";

import { enrichTextImport, runTextImportPipelineFast } from "@/pipeline";
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
import { getAIProviderFromEnv } from "@/services/ai";

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

    const fast = await runTextImportPipelineFast(parsed.data);

    if (fast.skippedDuplicate) {
      return NextResponse.json(
        {
          textId: fast.textId,
          sentenceCount: 0,
          wordCount: 0,
          phraseGroupCount: 0,
          sentencesNeedingReview: 0,
          warnings: fast.warnings,
          skippedDuplicate: true,
        },
        { status: 201 },
      );
    }

    if (fast.enrichmentPending) {
      const input = parsed.data;
      after(async () => {
        try {
          const provider = getAIProviderFromEnv();
          await enrichTextImport(input, fast.textId, fast.segments, provider, undefined, fast.qualityReport);
          logImportPhase("background enrichment complete", { textId: fast.textId });
        } catch (error) {
          logImportError("background enrichment", error, { textId: fast.textId });
        }
      });
    }

    const responseBody = {
      textId: fast.textId,
      sentenceCount: fast.sentenceCount,
      wordCount: fast.wordCount,
      phraseGroupCount: 0,
      sentencesNeedingReview: fast.sentenceCount,
      warnings: fast.warnings,
      skippedDuplicate: false,
      enrichmentPending: fast.enrichmentPending,
    };

    logImportPhase("POST /api/admin/texts/import fast complete", {
      textId: fast.textId,
      enrichmentPending: fast.enrichmentPending,
    });

    return NextResponse.json(responseBody, {
      status: fast.enrichmentPending ? 202 : 201,
    });
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
