export function verifyAdminRequest(request: Request): boolean {
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret) {
    return true;
  }
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${adminSecret}`;
}
