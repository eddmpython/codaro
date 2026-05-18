import { base } from "$app/paths";
import { redirect } from "@sveltejs/kit";

export function load() {
  throw redirect(308, `${base}/docs/blog`);
}
