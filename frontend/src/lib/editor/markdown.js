import { marked } from "marked";

marked.setOptions({
  breaks: true,
  gfm: true
});

export function renderMarkdown(source) {
  return marked.parse(source || "");
}
