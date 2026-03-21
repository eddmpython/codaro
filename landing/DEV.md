# Codaro Landing DEV

`landing/` is the public GitHub Pages surface for Codaro.

Current goals:
- home
- blog
- docs
- search
- feed / sitemap / llms files

Source of truth:
- blog content: `../blog/`
- docs content: `../docs/`
- brand assets: `../assets/brand/mascot/work/`

Rules:
- public UI language is English only
- public tone is zinc-based and calm
- `landing/` must stay separate from the local editor `editor/`
- blog asset URLs are flattened to `/blog/assets/*` during build
- `landing/` is the only shipped public docs surface
- long-form docs, blog posts, and search must not be embedded back into the IDE as a full docs browser
- IDE help affordances may link here, but product-internal `DEV.md`, `PRD.md`, `SPEC.md`, and launcher design docs stay out of public navigation

Current State:
- docs/build/search generation is the only public documentation path
- `landing/scripts/postbuild.js` now tolerates both `docs.html` and `docs/index.html` static outputs
- public install docs no longer expose internal launcher design documents by path

Next Action:
- keep public docs end-user facing and strip any future internal design references from docs/blog content
- add link policy review when new docs pages are introduced so internal repo paths do not leak back into generated search or llms files

Verification Left:
- spot-check future generated search index and `llms*.txt` outputs whenever docs content changes
- confirm GitHub Pages routing still behaves correctly for `/docs` and `/docs/...` after any SvelteKit adapter change
