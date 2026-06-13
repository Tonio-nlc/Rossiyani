import dynamic from "next/dynamic";

import { SkeletonCard } from "@/components/ui/skeleton";
import { listImportJobs } from "@/features/bulk-import";

const ImportWorkspace = dynamic(
  () => import("@/components/import/import-workspace").then((m) => ({ default: m.ImportWorkspace })),
  {
    loading: () => (
      <div className="space-y-6 pb-16">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    ),
  },
);

export default async function ImportPage() {
  const jobs = await listImportJobs(15).catch(() => []);
  return <ImportWorkspace initialJobs={jobs} />;
}
