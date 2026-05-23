import { brand } from "./brand";

/**
 * @typedef {{
 *   title?: string;
 *   description?: string;
 *   date?: string;
 *   url?: string;
 *   thumbnail?: string;
 * }} BlogPostLike
 *
 * @typedef {{
 *   title?: string;
 *   description?: string;
 *   url?: string;
 * }} DocsPageLike
 *
 * @typedef {{
 *   name: string;
 *   url?: string;
 * }} BreadcrumbItem
 *
 * @typedef {{
 *   title?: string;
 *   description?: string;
 *   url?: string;
 *   image?: string;
 *   type?: string;
 * }} MetaInput
 */

export function buildWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: brand.name,
    url: brand.siteUrl,
    description: brand.description,
    publisher: buildOrganizationJsonLd(),
    potentialAction: {
      "@type": "SearchAction",
      target: `${brand.siteUrl}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * @param {string | undefined} path
 */
function siteUrl(path) {
  return brand.toSiteUrl(path || "/");
}

export function buildOrganizationJsonLd() {
  return {
    "@type": "Organization",
    name: brand.name,
    url: brand.siteUrl,
    logo: `${brand.siteUrl}/brand/codaro-character.png`,
    sameAs: [brand.repoUrl],
  };
}

/**
 * @param {BlogPostLike} post
 */
export function buildBlogPostJsonLd(post) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description || "",
    datePublished: post.date ? new Date(post.date).toISOString() : undefined,
    url: siteUrl(post.url),
    image: post.thumbnail ? siteUrl(post.thumbnail) : brand.toSiteUrl("/brand/codaro-character.png"),
    author: buildOrganizationJsonLd(),
    publisher: buildOrganizationJsonLd(),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": siteUrl(post.url),
    },
  };
}

/**
 * @param {DocsPageLike} page
 */
export function buildDocsPageJsonLd(page) {
  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: page.title,
    description: page.description || "",
    url: siteUrl(page.url),
    author: buildOrganizationJsonLd(),
    publisher: buildOrganizationJsonLd(),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": siteUrl(page.url),
    },
  };
}

/**
 * @param {BreadcrumbItem[]} items
 */
export function buildBreadcrumbJsonLd(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url ? siteUrl(item.url) : undefined,
    })),
  };
}

export function buildSoftwareJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: brand.name,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Windows",
    description: brand.description,
    url: brand.siteUrl,
    downloadUrl: brand.launcherDownloadUrl,
    installUrl: brand.releaseUrl,
    author: buildOrganizationJsonLd(),
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };
}

/**
 * @param {MetaInput} input
 */
export function buildMeta({ title, description, url, image, type }) {
  const resolvedTitle = title ? `${title} - ${brand.name}` : brand.name;
  const resolvedDescription = description || brand.description;
  const resolvedUrl = url ? siteUrl(url) : brand.siteUrl;
  const resolvedImage = image || brand.toSiteUrl("/brand/codaro-character.png");
  const resolvedType = type || "website";

  return {
    title: resolvedTitle,
    description: resolvedDescription,
    og: {
      type: resolvedType,
      title: resolvedTitle,
      description: resolvedDescription,
      url: resolvedUrl,
      image: resolvedImage,
    },
    twitter: {
      card: "summary",
      title: resolvedTitle,
      description: resolvedDescription,
      image: resolvedImage,
    },
  };
}

/**
 * @param {unknown} data
 */
export function jsonLdScript(data) {
  return `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
}
