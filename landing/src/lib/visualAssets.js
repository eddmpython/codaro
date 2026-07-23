import { visualAssetManifest } from "./generated/visualAssetManifest.js";

export function resolveVisualAsset(assetId, options = {}) {
  const asset = visualAssetManifest.assets.find((candidate) => candidate.id === assetId);
  if (!asset) throw new Error(`Unknown visual asset: ${assetId}`);
  const basePath = options.basePath ?? import.meta.env.BASE_URL.replace(/\/$/, "");
  const preferredWidth = options.width ?? asset.rendering.width;
  const outputs = [...asset.outputs].sort((left, right) => left.width - right.width);
  const preferredFormat = options.format ?? "avif";
  const formatOutputs = outputs.filter((output) => output.format === preferredFormat);
  const selected = formatOutputs.find((output) => output.width >= preferredWidth) ?? formatOutputs.at(-1);
  if (!selected) throw new Error(`Visual asset has no ${preferredFormat} output: ${assetId}`);
  const url = (path) => `${basePath}${path}`;
  return {
    ...asset,
    alt: asset.learning.alt,
    caption: asset.learning.caption,
    height: selected.height,
    src: url(selected.publicPath),
    srcSet: formatOutputs.map((output) => `${url(output.publicPath)} ${output.width}w`).join(", "),
    sources: ["avif", "webp"].map((format) => ({
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
