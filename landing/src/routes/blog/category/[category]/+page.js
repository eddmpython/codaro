import { error } from "@sveltejs/kit";
import { postCategories, posts } from "$lib/generated/posts";

export function entries() {
  return postCategories.map((category) => ({ category: category.slug }));
}

export function load({ params }) {
  const category = postCategories.find((entry) => entry.slug === params.category);
  if (!category) {
    throw error(404, "Category not found");
  }
  return {
    category,
    posts: posts.filter((post) => post.category === params.category),
  };
}
