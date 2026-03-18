---
title: What Codaro is actually building
date: 2026-03-17
description: A public overview of Codaro as an interactive editor runtime for code, learning, and automation.
category: product-and-runtime
series: codaro-foundations
seriesOrder: 1
thumbnail: /brand/avatar-small.png
cardPreview: ./assets/001-codaro-runtime-map.svg
draft: false
---

# Codaro is not just another notebook clone

Codaro is building a runtime surface where code, guided learning, and automation share one model.

The local editor is only one part of the product. The public site explains the concepts, design choices, and workflow decisions behind that runtime.

## Three layers

1. A document model that can host code, text, and workflow blocks
2. An execution runtime that can run locally or in browser-oriented environments
3. A public knowledge surface for docs, changelog-style writing, and product reasoning

## Why keep the public site separate

The editor must stay focused on execution and interaction.

The public site has different constraints:

- static delivery
- SEO-friendly docs and blog
- stable GitHub Pages deployment
- searchable product writing

That is why Codaro keeps `landing/` separate from the local editor `frontend/`.

## Public docs are part of the product

The public site is not an afterthought.

It becomes the surface for:

- installation guides
- concept explanations
- reference pages
- blog posts that explain runtime decisions

## Public writing should stay close to the repo

Codaro stores blog posts under the root `blog/` folder and public docs under the root `docs/` folder. The Svelte public site reads those sources directly at build time.

That keeps writing close to the codebase while still producing a static site.
