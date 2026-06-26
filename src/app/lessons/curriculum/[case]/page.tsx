import { notFound } from "next/navigation";

import { LessonsBrowseSection, LessonsCollectionHeader } from "@/components/lessons";
import {
  getLessonsByCaseKeyword,
  getManualCurriculumCase,
  isManualCaseId,
  MANUAL_CASE_IDS,
} from "@/features/manual";
import { LESSONS_HOME } from "@/lib/lessons/paths";

type PageProps = {
  params: Promise<{ case: string }>;
};

export function generateStaticParams() {
  return MANUAL_CASE_IDS.map((caseId) => ({ case: caseId }));
}

export default async function LessonsCurriculumCasePage({ params }: PageProps) {
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
    <>
      <LessonsCollectionHeader
        title={curriculumCase.name}
        description={curriculumCase.description}
        meta={`${lessons.length} leçon${lessons.length > 1 ? "s" : ""}`}
        backHref={LESSONS_HOME}
        backLabel="← Leçons"
      />
      <LessonsBrowseSection
        title={curriculumCase.name}
        lessons={lessons}
        emptyMessage="Les leçons de ce cas arrivent bientôt."
      />
    </>
  );
}
