import { notFound } from "next/navigation";

import { ReaderView } from "@/components/reader/reader-view";
import { getTextForReader } from "@/features/texts";

import ReaderEmptyPage from "./empty-state";

type PageProps = { params: Promise<{ textId: string }> };

export default async function ReaderPage({ params }: PageProps) {
  const { textId } = await params;
  const text = await getTextForReader(textId);

  if (!text) {
    notFound();
  }

  if (text.sentences.length === 0) {
    return <ReaderEmptyPage textTitle={text.title} />;
  }

  return <ReaderView text={text} />;
}
