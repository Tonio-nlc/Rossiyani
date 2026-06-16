import { z } from "zod";

import { streamContextTranslationAnalysis } from "@/services/context-translation/analyze-context-translation";

const bodySchema = z.object({
  sourceText: z.string().min(1).max(2000),
});

function encodeEvent(payload: unknown): Uint8Array {
  return new TextEncoder().encode(`${JSON.stringify(payload)}\n`);
}

export async function POST(request: Request) {
  try {
    const body = bodySchema.parse(await request.json());
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of streamContextTranslationAnalysis(body.sourceText)) {
            controller.enqueue(encodeEvent(event));
            if (event.type === "error" || event.type === "complete") {
              break;
            }
          }
        } catch {
          controller.enqueue(
            encodeEvent({ type: "error", message: "Translation analysis failed" }),
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "application/x-ndjson; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: "Invalid request" }, { status: 400 });
    }
    return Response.json({ error: "Translation analysis failed" }, { status: 500 });
  }
}
