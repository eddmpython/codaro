import { brand } from "./brand.js";

export function buildLearningResourceJsonLd(lesson) {
  if (!lesson?.route || !Number.isFinite(lesson.estimatedMinutes)) return null;
  return {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: lesson.seo?.title || lesson.title,
    description: lesson.seo?.description || lesson.direction,
    inLanguage: "ko",
    url: brand.toSiteUrl(lesson.route),
    timeRequired: `PT${lesson.estimatedMinutes}M`,
    learningResourceType: "lesson",
    teaches: lesson.outcome,
    isPartOf: { "@id": `${brand.siteUrl}/learn` },
    provider: { "@id": `${brand.siteUrl}/#organization` },
  };
}

export function buildBreadcrumbJsonLd(path, title) {
  const segments = String(path || "/").split("/").filter(Boolean);
  if (segments.length === 0) return null;
  const items = [{ name: "홈", url: brand.toSiteUrl("/") }];
  let currentPath = "";
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    items.push({
      name: index === segments.length - 1 ? title : segmentLabel(segment),
      url: brand.toSiteUrl(currentPath),
    });
  });
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function buildFaqPageJsonLd(entries) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: "ko",
    mainEntity: entries.map((entry) => ({
      "@type": "Question",
      name: entry.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: entry.answer,
      },
    })),
  };
}

function segmentLabel(segment) {
  return {
    learn: "학습",
    lesson: "레슨",
    docs: "문서",
    blog: "Codaro 소식",
    packs: "공유 팩",
    tools: "도구",
    search: "검색",
    category: "카테고리",
    series: "시리즈",
  }[segment] || segment;
}
