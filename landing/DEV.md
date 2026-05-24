# Codaro Landing DEV

`landing/` is the public GitHub Pages surface for Codaro.

Current goals:
- home product landing
- desktop launcher download path
- docs
- docs writing
- search
- feed / sitemap / llms files

Source of truth:
- docs content: `../docs/`
- writing content: `../docs/blog/`
- brand assets: `../assets/brand/mascot/work/`

Rules:
- public UI language is English only
- public tone is zinc-based and calm
- `landing/` must stay separate from the local editor `editor/`
- `landing/src/app.css` mirrors the editor shadcn token names for color, radius, border, and ring values
- framework parity is visual/token parity here; React product code stays in `editor/`, while public docs and writing stay in the Svelte static site
- launcher download CTAs must point to GitHub Release assets, not repo-internal build paths
- `.github/workflows/launcher-release.yml` is responsible for publishing `CodaroLauncher.exe`, checksum, and SBOM with stable asset names
- writing asset URLs are flattened to `/docs/blog/assets/*` during build
- `landing/` is the only shipped public docs surface
- long-form docs, writing, and search must not be embedded back into the IDE as a full docs browser
- IDE help affordances may link here, but product-internal `DEV.md`, `PRD.md`, `SPEC.md`, and launcher design docs stay out of public navigation

Current State:
- the home page is the public product landing and links to the latest launcher release asset
- docs/build/search generation is the only public documentation path
- writing is generated from `../docs/blog/` and published under `/docs/blog/...`
- legacy `/blog/...` routes redirect to `/docs/blog/...`
- public install docs no longer expose internal launcher design documents by path

Next Action:
- keep public docs end-user facing and strip any future internal design references from docs writing content
- add link policy review when new docs pages are introduced so internal repo paths do not leak back into generated search or llms files

Verification Left:
- spot-check future generated search index and `llms*.txt` outputs whenever docs content changes
- confirm GitHub Pages routing still behaves correctly for `/docs` and `/docs/...` after any SvelteKit adapter change
