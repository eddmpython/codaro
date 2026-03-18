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
- `landing/` must stay separate from the local editor `frontend/`
- blog asset URLs are flattened to `/blog/assets/*` during build
