import type { Metadata } from "next";

import { ReviewWorkspace } from "@/components/review";

import "../review-workspace.css";

export const metadata: Metadata = {
  title: "Review — Rossiyani",
  description: "Révisions espacées à partir de vos lectures.",
};

export default function ReviewPage() {
  return <ReviewWorkspace />;
}
