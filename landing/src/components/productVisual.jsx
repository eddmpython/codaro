import { resolveVisualAsset } from "../lib/visualAssets.js";

export function ProductVisual({ assetId, className, eager = false, width }) {
  const asset = resolveVisualAsset(assetId, { format: "webp", width });
  return (
    <picture className={className}>
      {asset.sources.map((source) => (
        <source key={source.format} srcSet={source.srcSet} type={source.type} />
      ))}
      <img
        alt={asset.alt}
        fetchPriority={eager ? "high" : "auto"}
        height={asset.height}
        loading={eager ? "eager" : "lazy"}
        sizes="(max-width: 640px) 100vw, (max-width: 1000px) 92vw, 1100px"
        src={asset.src}
        srcSet={asset.srcSet}
        width={asset.width}
      />
    </picture>
  );
}
