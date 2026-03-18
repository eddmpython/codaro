import { error } from "@sveltejs/kit";
import { docsPages, docsSections } from "$lib/generated/docsNav";

export function entries() {
  return docsPages.map((page) => ({ slug: page.slugSegments }));
}

export function load({ params }) {
  const path = Array.isArray(params.slug) ? params.slug.join("/") : params.slug || "";
  const page = docsPages.find((entry) => entry.path === path);
  if (!page) {
    throw error(404, "Docs page not found");
  }
  return { page, docsSections };
}
