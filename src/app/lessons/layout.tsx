import { LessonsShell } from "@/components/lessons";

export default function LessonsLayout({ children }: { children: React.ReactNode }) {
  return <LessonsShell>{children}</LessonsShell>;
}
