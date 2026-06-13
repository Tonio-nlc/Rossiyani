import { Suspense } from "react";

import { LibraryPageContent } from "@/components/library/library-page-content";
import { listTexts } from "@/features/texts";

export default async function LibraryPage() {
  const texts = await listTexts();
  return (
    <Suspense fallback={null}>
      <LibraryPageContent initialTexts={texts} />
    </Suspense>
  );
}
