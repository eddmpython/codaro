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
  },
  {
    "slug": "codaro-public-launch-skeleton",
    "title": "Codaro public launch skeleton",
    "date": "Sat May 23 2026 09:00:00 GMT+0900 (대한민국 표준시)",
    "description": "A launch-oriented overview of Codaro as a local-first Python learning and automation studio.",
    "category": "product-and-runtime",
    "categoryLabel": "Product and Runtime",
    "categoryFolder": "01-product-and-runtime",
    "categoryPath": "/codaro/docs/blog/category/product-and-runtime",
    "series": "codaro-foundations",
    "seriesOrder": 2,
    "thumbnail": "/codaro/brand/avatar-small.png",
    "cardPreview": "/codaro/docs/blog/assets/002-public-launch-map.svg",
    "draft": false,
    "url": "/codaro/docs/blog/codaro-public-launch-skeleton",
    "html": "<h1>Codaro public launch skeleton</h1>\n<p>Codaro is a local-first studio for learning Python, running code, and growing useful scripts into personal automation.</p>\n<p>The first public story should be simple:</p>\n<ol>\n<li>Learn with structured cards.</li>\n<li>Run code in cells.</li>\n<li>Use real local data.</li>\n<li>Turn repeated work into a safe automation plan.</li>\n</ol>\n<h2>The first five minutes</h2>\n<p>The launch path starts with two runnable demos:</p>\n<pre><code class=\"language-powershell\">uv run python -X utf8 demos/publicLaunch/expenseSummaryDemo.py\nuv run python -X utf8 demos/publicLaunch/fileOrganizerDemo.py\n</code></pre>\n<p>The first demo reads a small CSV and summarizes spending by category. The second demo builds a dry-run file organization plan without moving or deleting anything.</p>\n<p>That is the product story in miniature: learn, run, inspect, automate.</p>\n<h2>Why local-first matters</h2>\n<p>Codaro should remain useful before any provider is connected. A beginner can open the Python course, run cells, and inspect outputs without sending private files elsewhere.</p>\n<p>Provider-backed features can improve personalization, but they are not the foundation of the first-run path.</p>\n<h2>What makes the release credible</h2>\n<p>Public readiness is not a claim in a README. It is checked by gates:</p>\n<ul>\n<li><code>quality-cycle</code></li>\n<li><code>objective-nineplus-audit</code></li>\n<li><code>public-readiness-audit</code></li>\n</ul>\n<p>The release also ships with security, privacy, support, contribution, license, and trademark boundaries at the repository root.</p>\n<h2>What to show in the video</h2>\n<p>The 90-second demo should show:</p>\n<ul>\n<li>a learning card and a code cell</li>\n<li>CSV summary output</li>\n<li>a dry-run automation plan</li>\n<li>diagnostic and support paths</li>\n<li>the public readiness checklist</li>\n</ul>\n<p>The goal is not to explain every feature. The goal is to make the viewer think: “I can try this right now.”</p>\n",
    "text": "Codaro public launch skeleton Codaro is a local first studio for learning Python, running code, and growing useful scripts into personal automation. The first public story should be simple: 1. Learn with structured cards. 2. Run code in cells. 3. Use real local data. 4. Turn repeated work into a safe automation plan. The first five minutes The launch path starts with two runnable demos: The first demo reads a small CSV and summarizes spending by category. The second demo builds a dry run file organization plan without moving or deleting anything. That is the product story in miniature: learn, run, inspect, automate. Why local first matters Codaro should remain useful before any provider is connected. A beginner can open the Python course, run cells, and inspect outputs without sending private files elsewhere. Provider backed features can improve personalization, but they are not the foundation of the first run path. What makes the release credible Public readiness is not a claim in a README. It is checked by gates: The release also ships with security, privacy, support, contribution, license, and trademark boundaries at the repository root. What to show in the video The 90 second demo should show: a learning card and a code cell CSV summary output a dry run automation plan diagnostic and support paths the public readiness checklist The goal is not to explain every feature. The goal is to make the viewer think: “I can try this right now.”"
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
