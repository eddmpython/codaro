export const posts = [
  {
    "slug": "what-is-codaro",
    "title": "What Codaro is actually building",
    "date": "Tue Mar 17 2026 09:00:00 GMT+0900 (대한민국 표준시)",
    "description": "A public overview of Codaro as an interactive editor runtime for code, learning, and automation.",
    "category": "product-and-runtime",
    "categoryLabel": "Product and Runtime",
    "categoryFolder": "01-product-and-runtime",
    "categoryPath": "/codaro/docs/blog/category/product-and-runtime",
    "series": "codaro-foundations",
    "seriesOrder": 1,
    "thumbnail": "/codaro/brand/avatar-small.png",
    "cardPreview": "/codaro/docs/blog/assets/001-codaro-runtime-map.svg",
    "draft": false,
    "url": "/codaro/docs/blog/what-is-codaro",
    "html": "<h1>Codaro is not just another notebook clone</h1>\n<p>Codaro is building a runtime surface where code, guided learning, and automation share one model.</p>\n<p>The local editor is only one part of the product. The public site explains the concepts, design choices, and workflow decisions behind that runtime.</p>\n<h2>Three layers</h2>\n<ol>\n<li>A document model that can host code, text, and workflow blocks</li>\n<li>An execution runtime that can run locally or in browser-oriented environments</li>\n<li>A docs-based public knowledge surface for guides, changelog-style writing, and product reasoning</li>\n</ol>\n<h2>Why keep the public site separate</h2>\n<p>The editor must stay focused on execution and interaction.</p>\n<p>The public site has different constraints:</p>\n<ul>\n<li>static delivery</li>\n<li>SEO-friendly docs and writing</li>\n<li>stable GitHub Pages deployment</li>\n<li>searchable product writing</li>\n</ul>\n<p>That is why Codaro keeps <code>landing/</code> separate from the local editor <code>frontend/</code>.</p>\n<h2>Public docs are part of the product</h2>\n<p>The public site is not an afterthought.</p>\n<p>It becomes the surface for:</p>\n<ul>\n<li>installation guides</li>\n<li>concept explanations</li>\n<li>reference pages</li>\n<li>writing that explains runtime decisions</li>\n</ul>\n<h2>Public writing should stay close to the repo</h2>\n<p>Codaro stores public docs, operating notes, and writing under the root <code>docs/</code> folder. The Svelte public site reads those sources directly at build time.</p>\n<p>That keeps writing close to the codebase while still producing a static site.</p>\n",
    "text": "Codaro is not just another notebook clone Codaro is building a runtime surface where code, guided learning, and automation share one model. The local editor is only one part of the product. The public site explains the concepts, design choices, and workflow decisions behind that runtime. Three layers 1. A document model that can host code, text, and workflow blocks 2. An execution runtime that can run locally or in browser oriented environments 3. A docs based public knowledge surface for guides, changelog style writing, and product reasoning Why keep the public site separate The editor must stay focused on execution and interaction. The public site has different constraints: static delivery SEO friendly docs and writing stable GitHub Pages deployment searchable product writing That is why Codaro keeps separate from the local editor . Public docs are part of the product The public site is not an afterthought. It becomes the surface for: installation guides concept explanations reference pages writing that explains runtime decisions Public writing should stay close to the repo Codaro stores public docs, operating notes, and writing under the root folder. The Svelte public site reads those sources directly at build time. That keeps writing close to the codebase while still producing a static site."
  }
];
export const postCategories = [
  {
    "slug": "product-and-runtime",
    "label": "Product and Runtime"
  }
];
export const postSeries = [
  {
    "slug": "codaro-foundations",
    "label": "codaro-foundations"
  }
];
