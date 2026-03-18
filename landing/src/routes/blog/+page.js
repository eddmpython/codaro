import { posts, postCategories } from "$lib/generated/posts";

export function load() {
  return {
    posts,
    postCategories,
  };
}
