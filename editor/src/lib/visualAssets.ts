import { visualAssetManifest } from "@/lib/generated/visualAssetManifest";

export type VisualAssetId = (typeof visualAssetManifest.assets)[number]["id"];
type VisualAssetFormat = "avif" | "webp";
type VisualAssetTheme = "light" | "dark";

export function isVisualAssetId(value: string): value is VisualAssetId {
  return visualAssetManifest.assets.some((candidate) => candidate.id === value);
}

export function resolveVisualAsset(
  assetId: VisualAssetId,
  options: { format?: VisualAssetFormat; theme?: VisualAssetTheme; width?: number } = {},
) {
  const requestedAsset = visualAssetManifest.assets.find((candidate) => candidate.id === assetId);
  if (!requestedAsset) throw new Error(`Unknown visual asset: ${assetId}`);
  const themePairId = "themePairId" in requestedAsset ? requestedAsset.themePairId : null;
  const requestedTheme = "capture" in requestedAsset ? requestedAsset.capture.theme : null;
  const pairedAsset = themePairId
    ? visualAssetManifest.assets.find((candidate) => candidate.id === themePairId)
    : null;
  const asset = options.theme && pairedAsset && requestedTheme !== options.theme
    ? pairedAsset
    : requestedAsset;
  const preferredWidth = options.width ?? asset.rendering.width;
  const preferredFormat = options.format ?? "avif";
  const outputs = [...asset.outputs].sort((left, right) => left.width - right.width);
  const formatOutputs = outputs.filter((output) => output.format === preferredFormat);
  const selected = formatOutputs.find((output) => output.width >= preferredWidth) ?? formatOutputs.at(-1);
  if (!selected) throw new Error(`Visual asset has no ${preferredFormat} output: ${assetId}`);
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
  const url = (path: string) => `${basePath}${path}`;
  return {
    ...asset,
    logicalId: assetId,
    themeAssetId: asset.id,
    alt: asset.learning.alt,
    caption: asset.learning.caption,
    height: selected.height,
    src: url(selected.publicPath),
    srcSet: formatOutputs.map((output) => `${url(output.publicPath)} ${output.width}w`).join(", "),
    sources: (["avif", "webp"] as const).map((format) => ({
      format,
      srcSet: outputs
        .filter((output) => output.format === format)
        .map((output) => `${url(output.publicPath)} ${output.width}w`)
        .join(", "),
      type: `image/${format}`,
    })),
    width: selected.width,
  };
}
