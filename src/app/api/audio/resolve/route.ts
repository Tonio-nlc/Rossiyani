import { NextResponse } from "next/server";
import { z } from "zod";

import { isAudioFallback, resolveAudioClip } from "@/services/audio";

const bodySchema = z.discriminatedUnion("scope", [
  z.object({
    scope: z.literal("sentence"),
    entityId: z.string().min(1),
    voiceId: z.string().optional(),
  }),
  z.object({
    scope: z.literal("word"),
    entityId: z.string().min(1),
    voiceId: z.string().optional(),
  }),
  z.object({
    scope: z.literal("utterance"),
    text: z.string().min(1),
    cacheKey: z.string().optional(),
    voiceId: z.string().optional(),
  }),
]);

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Requête audio invalide." }, { status: 400 });
    }

    const result = await resolveAudioClip(parsed.data);

    if (isAudioFallback(result)) {
      return NextResponse.json(result);
    }

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Échec de la résolution audio.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
