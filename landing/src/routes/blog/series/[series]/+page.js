import { error } from "@sveltejs/kit";
import { postSeries, posts } from "$lib/generated/posts";

export function entries() {
  return postSeries.map((series) => ({ series: series.slug }));
}

export function load({ params }) {
  const series = postSeries.find((entry) => entry.slug === params.series);
  if (!series) {
    throw error(404, "Series not found");
  }
  return {
    series,
    posts: posts.filter((post) => post.series === params.series).sort((left, right) => left.seriesOrder - right.seriesOrder),
  };
}
