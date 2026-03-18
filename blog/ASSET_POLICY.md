# Codaro Blog Asset Policy

Blog assets live inside each post folder under `assets/`.

## Placement

- Store assets only inside the matching post folder.
- Do not create a shared root `blog/assets/` source folder.
- Reference assets with relative paths such as `./assets/file.svg`.

## Naming

- Every asset name must start with the post number.
- Example: `001-codaro-runtime-map.svg`
- Duplicate asset file names across posts are treated as build errors.

## Build behavior

- Build copies post assets to `landing/static/blog/assets/`.
- Public URLs become `/blog/assets/<filename>`.
- Keep filenames globally unique to avoid collisions.
