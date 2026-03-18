# Codaro Blog Structure

This blog uses the `category folder -> post folder -> index.md + assets/` pattern.

## Categories

- `01-product-and-runtime`
- `02-editor-and-notebooks`
- `03-learning-and-workflows`
- `04-automation-and-apps`

Category numbers are fixed. Add a new number instead of renaming existing categories.

## Numbering

- Category numbers are for grouping.
- Post numbers are global and never reused.
- Series order is controlled by `seriesOrder`.

Example:

```text
blog/
  02-editor-and-notebooks/
    012-cell-shoulder-and-toolbar/
      index.md
      assets/
```

## URL rules

- Category folders do not appear in the public URL.
- `blog/02-editor-and-notebooks/012-cell-shoulder-and-toolbar/index.md`
- URL: `/blog/cell-shoulder-and-toolbar`

## Frontmatter rules

Every post must provide:

```yaml
title: Post title
date: YYYY-MM-DD
description: One sentence summary
category: product-and-runtime | editor-and-notebooks | learning-and-workflows | automation-and-apps
series: series id
seriesOrder: number
thumbnail: /brand/avatar-small.png
cardPreview: ./assets/012-preview.svg
draft: false
```

## Operations

- `BLOG_STRUCTURE.md`: category, numbering, and URL rules
- `ASSET_POLICY.md`: asset placement and naming rules
- `TOPIC_ROADMAP.md`: writing backlog and topic queue
