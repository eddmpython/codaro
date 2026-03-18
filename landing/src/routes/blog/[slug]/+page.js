import { error } from "@sveltejs/kit";
import { posts } from "$lib/generated/posts";

export function entries() {
  return posts.map((post) => ({ slug: post.slug }));
}

export function load({ params }) {
  const post = posts.find((candidate) => candidate.slug === params.slug);
  if (!post) {
    throw error(404, "Post not found");
  }
  return { post };
}
