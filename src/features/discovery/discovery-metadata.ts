import type { TodaysDiscovery } from "./types";

export function discoveryMetadataLine(discovery: TodaysDiscovery): string {
  const register =
    discovery.register === "neutral"
      ? null
      : discovery.register.charAt(0).toUpperCase() + discovery.register.slice(1);
  const topic = discovery.topics[0];
  return [discovery.typeLabel, discovery.difficulty, register, topic]
    .filter(Boolean)
    .join(" · ");
}
