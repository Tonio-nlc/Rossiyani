import Image from "next/image";

import type { MediaAssetId } from "@/media/catalog/static-catalog";
import { resolveMediaAsset } from "@/media/resolve-media-asset";
import type { MediaAsset } from "@/media/types";

type MediaImageProps = {
  assetId: MediaAssetId;
  /** Override catalog alt when needed for a specific context. */
  alt?: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
  fill?: boolean;
};

function dimensions(asset: MediaAsset) {
  return {
    width: asset.width ?? 1200,
    height: asset.height ?? 800,
  };
}

/**
 * Presentation helper for raster media.
 * Product components pass a catalog id — never a file path.
 */
export function MediaImage({
  assetId,
  alt,
  className,
  priority = false,
  sizes,
  fill = false,
}: MediaImageProps) {
  const asset = resolveMediaAsset(assetId);
  const { width, height } = dimensions(asset);

  if (fill) {
    return (
      <Image
        src={asset.delivery.url}
        alt={alt ?? asset.alt}
        fill
        priority={priority}
        sizes={sizes}
        className={className}
      />
    );
  }

  return (
    <Image
      src={asset.delivery.url}
      alt={alt ?? asset.alt}
      width={width}
      height={height}
      priority={priority}
      sizes={sizes}
      className={className}
    />
  );
}
