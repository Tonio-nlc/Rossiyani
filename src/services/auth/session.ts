import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";
import type { AuthSession, AuthUser } from "@/lib/auth/types";
import { SESSION_COOKIE, SESSION_DURATION_MS } from "@/lib/auth/types";

import { createOpaqueToken, hashOpaqueToken } from "./crypto";

function toAuthUser(user: {
  id: string;
  email: string;
  displayName: string | null;
  createdAt: Date;
}): AuthUser {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    createdAt: user.createdAt.toISOString(),
  };
}

export async function createSession(userId: string): Promise<string> {
  const token = createOpaqueToken();
  const tokenHash = await hashOpaqueToken(token);
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await prisma.session.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
    },
  });

  return token;
}

export async function deleteSessionByToken(token: string): Promise<void> {
  const tokenHash = await hashOpaqueToken(token);
  await prisma.session.deleteMany({ where: { tokenHash } });
}

export async function getSessionFromToken(token: string): Promise<AuthSession | null> {
  const tokenHash = await hashOpaqueToken(token);
  const session = await prisma.session.findUnique({
    where: { tokenHash },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          displayName: true,
          createdAt: true,
        },
      },
    },
  });

  if (!session || session.expiresAt.getTime() <= Date.now()) {
    if (session) {
      await prisma.session.delete({ where: { id: session.id } }).catch(() => undefined);
    }
    return null;
  }

  return {
    user: toAuthUser(session.user),
  };
}

export async function getServerSession(): Promise<AuthSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) {
    return null;
  }
  return getSessionFromToken(token);
}

export function sessionCookieOptions(token: string) {
  return {
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DURATION_MS / 1000,
  };
}

export function clearSessionCookieOptions() {
  return {
    name: SESSION_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  };
}
