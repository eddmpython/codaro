import { visualAssetManifest } from "@/lib/generated/visualAssetManifest";

type VisualAssetId = (typeof visualAssetManifest.assets)[number]["id"];
type VisualAssetFormat = "avif" | "webp";

export function resolveVisualAsset(
  assetId: VisualAssetId,
  options: { format?: VisualAssetFormat; width?: number } = {},
) {
  const asset = visualAssetManifest.assets.find((candidate) => candidate.id === assetId);
  if (!asset) throw new Error(`Unknown visual asset: ${assetId}`);
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
