import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  LEARNER_COOKIE_MAX_AGE,
  LEARNER_ID_COOKIE,
  LEARNER_ID_HEADER,
} from "@/features/discovery/cookies";

export function middleware(request: NextRequest) {
  const existingId = request.cookies.get(LEARNER_ID_COOKIE)?.value;
  const learnerId = existingId ?? crypto.randomUUID();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(LEARNER_ID_HEADER, learnerId);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  if (!existingId) {
    response.cookies.set(LEARNER_ID_COOKIE, learnerId, {
      maxAge: LEARNER_COOKIE_MAX_AGE,
      path: "/",
      sameSite: "lax",
    });
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
