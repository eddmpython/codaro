import { resolveVisualAsset } from "../lib/visualAssets.js";
import { useCodaroTheme } from "./codaroThemeProvider.jsx";

export function ProductVisual({ assetId, className, eager = false, width }) {
  const { resolvedTheme } = useCodaroTheme();
  const asset = resolveVisualAsset(assetId, { format: "webp", theme: resolvedTheme, width });
  return (
    <picture
      className={className}
      data-visual-asset={asset.logicalId}
      data-visual-capture-theme={asset.capture?.theme}
      data-visual-kind={asset.kind}
      data-visual-theme={resolvedTheme}
      data-visual-theme-asset={asset.themeAssetId}
      data-visual-theme-paired={asset.variants.lightDark === "paired" ? "true" : undefined}
    >
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
