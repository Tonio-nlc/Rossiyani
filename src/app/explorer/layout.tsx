import { ExplorerWorkspaceLayout } from "@/components/explorer/explorer-workspace-layout";

export default function ExplorerLayout({
  children,
  microscope,
}: {
  children: React.ReactNode;
  microscope: React.ReactNode;
}) {
  return <ExplorerWorkspaceLayout microscope={microscope}>{children}</ExplorerWorkspaceLayout>;
}
