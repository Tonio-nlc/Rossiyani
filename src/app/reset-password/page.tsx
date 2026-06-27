import { Suspense } from "react";

import ResetPasswordPage from "./reset-password-client";

export default function Page() {
  return (
    <Suspense fallback={<div className="auth-page"><p>Chargement…</p></div>}>
      <ResetPasswordPage />
    </Suspense>
  );
}
