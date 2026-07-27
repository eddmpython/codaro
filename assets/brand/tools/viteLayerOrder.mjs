export const CODARO_CASCADE_LAYER_ORDER =
  "@layer reset, theme, base, astryx-base, astryx-theme, components, utilities;";

export function codaroLayerOrderPlugin() {
  return {
    name: "codaro-cascade-layer-order",
    transformIndexHtml: {
      order: "pre",
      handler(html) {
        const normalizedHtml = html.replace(/\r\n/g, "\n");
        const layerStyle =
          `<style data-codaro-layer-order="true">${CODARO_CASCADE_LAYER_ORDER}</style>`;
        return normalizedHtml.replace("<head>", `<head>\n    ${layerStyle}`);
      },
    },
  };
}
