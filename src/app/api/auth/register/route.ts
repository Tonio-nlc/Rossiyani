import { NextResponse } from "next/server";

import { normalizeEmail, registerSchema } from "@/lib/auth/validation";
import {
  createSession,
  sessionCookieOptions,
} from "@/services/auth/session";
import { createUser, findUserByEmail } from "@/services/auth/user-repository";
import { ensureUserDataRow } from "@/services/sync/user-sync-repository";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = registerSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "Inscription invalide." },
        { status: 400 },
      );
    }

    const email = normalizeEmail(parsed.data.email);
    const existing = await findUserByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: "Un compte existe déjà avec cette adresse e-mail." },
        { status: 409 },
      );
    }

    const user = await createUser({
      email,
      password: parsed.data.password,
      displayName: parsed.data.displayName,
    });

    await ensureUserDataRow(user.id);

    const token = await createSession(user.id);
    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        createdAt: user.createdAt.toISOString(),
      },
    });
    response.cookies.set(sessionCookieOptions(token));
    return response;
  } catch {
    return NextResponse.json({ error: "Impossible de créer le compte." }, { status: 500 });
  }
}
