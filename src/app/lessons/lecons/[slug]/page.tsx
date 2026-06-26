import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LessonsLessonView } from "@/components/lessons";
import { getLessonBySlug, listLessonSummaries } from "@/features/manual";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return listLessonSummaries().map((lesson) => ({ slug: lesson.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const lesson = getLessonBySlug(slug);
  if (!lesson) {
    return { title: "Leçon introuvable — Rossiyani" };
  }
  return {
    title: `${lesson.title} — Leçons · Rossiyani`,
    description: lesson.keywords.join(", "),
  };
}

export default async function LessonDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const lesson = getLessonBySlug(slug);
  if (!lesson) {
    notFound();
  }

  return <LessonsLessonView lesson={lesson} />;
}
