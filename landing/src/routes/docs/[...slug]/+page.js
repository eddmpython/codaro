import { error } from "@sveltejs/kit";
import { docsPages, docsSections } from "$lib/generated/docsNav";

const docsPageModules = import.meta.glob("../../../lib/generated/docsPages/*.js");

export function entries() {
  return docsPages.map((page) => ({ slug: page.slugSegments.join("/") }));
}

export async function load({ params }) {
  const path = Array.isArray(params.slug) ? params.slug.join("/") : params.slug || "";
  const pageMeta = docsPages.find((entry) => entry.path === path);
  if (!pageMeta) {
    throw error(404, "Docs page not found");
  }
  const contentModulePath = `../../../lib/generated/docsPages/${pageMeta.contentModule}.js`;
  const loadContent = docsPageModules[contentModulePath];
  if (!loadContent) {
    throw error(404, "Docs page content not found");
  }
  const { pageContent } = /** @type {{ pageContent: object }} */ (await loadContent());
  const page = /** @type {any} */ ({ ...pageMeta, ...pageContent });
  return { page, docsSections };
}
