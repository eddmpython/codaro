import { brand } from "./brand";

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

export function buildOrganizationJsonLd() {
  return {
    "@type": "Organization",
    name: brand.name,
    url: brand.siteUrl,
    logo: `${brand.siteUrl}/brand/avatar-full.png`,
    sameAs: [brand.repoUrl],
  };
}

export function buildBlogPostJsonLd(post) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description || "",
    datePublished: post.date ? new Date(post.date).toISOString() : undefined,
    url: `${brand.siteUrl}${post.url || ""}`,
    image: post.thumbnail ? `${brand.siteUrl}${post.thumbnail}` : `${brand.siteUrl}/brand/avatar-full.png`,
    author: buildOrganizationJsonLd(),
    publisher: buildOrganizationJsonLd(),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${brand.siteUrl}${post.url || ""}`,
    },
  };
}

export function buildDocsPageJsonLd(page) {
  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: page.title,
    description: page.description || "",
    url: `${brand.siteUrl}${page.url || ""}`,
    author: buildOrganizationJsonLd(),
    publisher: buildOrganizationJsonLd(),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${brand.siteUrl}${page.url || ""}`,
    },
  };
}

export function buildBreadcrumbJsonLd(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url ? `${brand.siteUrl}${item.url}` : undefined,
    })),
  };
}

export function buildSoftwareJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: brand.name,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Windows, macOS, Linux",
    description: brand.description,
    url: brand.siteUrl,
    downloadUrl: `${brand.repoUrl}/releases`,
    author: buildOrganizationJsonLd(),
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };
}

export function buildMeta({ title, description, url, image, type }) {
  const resolvedTitle = title ? `${title} — ${brand.name}` : brand.name;
  const resolvedDescription = description || brand.description;
  const resolvedUrl = url ? `${brand.siteUrl}${url}` : brand.siteUrl;
  const resolvedImage = image || `${brand.siteUrl}/brand/avatar-full.png`;
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

export function jsonLdScript(data) {
  return `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
}
