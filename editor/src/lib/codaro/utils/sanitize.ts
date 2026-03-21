import DOMPurify from "dompurify";

const purify = DOMPurify(window);

purify.setConfig({
  ALLOWED_TAGS: [
    "h1", "h2", "h3", "h4", "h5", "h6",
    "p", "br", "hr", "blockquote", "pre", "code",
    "ul", "ol", "li", "dl", "dt", "dd",
    "table", "thead", "tbody", "tr", "th", "td",
    "a", "strong", "em", "del", "s", "sub", "sup",
    "img", "figure", "figcaption",
    "div", "span", "details", "summary",
  ],
  ALLOWED_ATTR: [
    "href", "target", "rel", "src", "alt", "title",
    "class", "id", "width", "height", "colspan", "rowspan",
  ],
  ALLOW_DATA_ATTR: false,
});

purify.addHook("afterSanitizeAttributes", (node) => {
  if (node.tagName === "A") {
    node.setAttribute("rel", "noopener noreferrer");
    node.setAttribute("target", "_blank");
  }
});

export function sanitizeHtml(dirty: string): string {
  return purify.sanitize(dirty) as string;
}
