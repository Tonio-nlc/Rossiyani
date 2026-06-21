import { notFound } from "next/navigation";

import { ManualLessonGrid } from "@/components/manual";
import {
  getLessonsByCaseKeyword,
  getManualCurriculumCase,
  isManualCaseId,
  MANUAL_CASE_IDS,
} from "@/features/manual";

type PageProps = {
  params: Promise<{ case: string }>;
};

export function generateStaticParams() {
  return MANUAL_CASE_IDS.map((caseId) => ({ case: caseId }));
}

export default async function ManualCurriculumCasePage({ params }: PageProps) {
  const { case: caseParam } = await params;
  if (!isManualCaseId(caseParam)) {
    notFound();
  }

  const curriculumCase = getManualCurriculumCase(caseParam);
  if (!curriculumCase) {
    notFound();
  }

  const lessons = getLessonsByCaseKeyword(curriculumCase.keyword);

  return (
    <div className="manual-scholar-curriculum">
      <header className="manual-scholar-curriculum__header">
        <p className="manual-scholar-curriculum__eyebrow">Architectural Grammar</p>
        <h1 className="manual-scholar-curriculum__title">{curriculumCase.name}</h1>
        <p className="manual-scholar-curriculum__lead">{curriculumCase.description}</p>
      </header>

      <section className="manual-scholar-curriculum__lessons" aria-label="Leçons du curriculum">
        <ManualLessonGrid
          lessons={lessons}
          emptyMessage="Les leçons de ce cas arrivent bientôt."
        />
      </section>
    </div>
  );
}
