export const SESSION_COOKIE = "rossiyani_session";
export const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 30; // 30 days
export const RESET_TOKEN_DURATION_MS = 1000 * 60 * 60; // 1 hour

export type AuthUser = {
  id: string;
  email: string;
  displayName: string | null;
  createdAt: string;
};

export type AuthSession = {
  user: AuthUser;
};
