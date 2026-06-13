import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ManualLessonView } from "@/components/manual";
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
    title: `${lesson.title} — Manuel Rossiyani`,
    description: lesson.keywords.join(", "),
  };
}

export default async function ManualLessonPage({ params }: PageProps) {
  const { slug } = await params;
  const lesson = getLessonBySlug(slug);
  if (!lesson) {
    notFound();
  }

  return <ManualLessonView lesson={lesson} />;
}
