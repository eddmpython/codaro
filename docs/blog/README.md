# Codaro Docs Writing

`docs/blog/` is the source of truth for public writing published under `/docs/blog/...`.

This is not a separate documentation surface. It is the writing layer inside the docs system:

- operational rules and API-shaped decisions stay in `docs/skills/`
- public essays and product reasoning stay in `docs/blog/`
- GitHub Pages reads both from `docs/` during the Svelte build
- legacy `/blog/...` routes redirect to `/docs/blog/...`

Use `BLOG_STRUCTURE.md`, `ASSET_POLICY.md`, and `TOPIC_ROADMAP.md` for writing operations.
