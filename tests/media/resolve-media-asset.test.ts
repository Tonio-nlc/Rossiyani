import { describe, expect, it } from "vitest";

import { resolveMediaAsset } from "@/media/resolve-media-asset";

describe("resolveMediaAsset", () => {
  it("resolves dashboard hero from local-public catalog", () => {
    const asset = resolveMediaAsset("dashboard.hero");

    expect(asset.id).toBe("dashboard.hero");
    expect(asset.kind).toBe("illustration");
    expect(asset.delivery.backend).toBe("local-public");
    expect(asset.delivery.url).toBe("/illustrations/hero_image.png");
    expect(asset.width).toBe(2338);
    expect(asset.height).toBe(1474);
  });
});
