import { HomeTodaysDiscovery } from "./home-todays-discovery";

type HomeWorkspaceDiscoveryProps = {
  discovery: import("@/features/discovery").TodaysDiscovery | null;
};

export function HomeWorkspaceDiscovery({ discovery }: HomeWorkspaceDiscoveryProps) {
  return <HomeTodaysDiscovery discovery={discovery} />;
}
