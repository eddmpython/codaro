import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { docsPages } from "../src/lib/generated/docsNav.js";
import { posts, postCategories, postSeries } from "../src/lib/generated/posts.js";
import { searchEntries } from "../src/lib/generated/searchIndex.js";
import { sharePacks } from "../src/lib/sharePacks.js";
import { tools } from "../src/lib/tools/registry.js";
import { brand } from "../src/lib/brand.js";
import { faqEntries } from "../src/lib/faq.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const landingRoot = resolve(__dirname, "..");
const buildRoot = resolve(landingRoot, "build");
const shellPath = resolve(buildRoot, "index.html");
const shell = readFileSync(shellPath, "utf-8");
const basePath = "/codaro";

const docsContentEntries = await Promise.all(
  docsPages.map(async (page) => {
    const module = await import(`../src/lib/generated/docsPages/${page.contentModule}.js`);
    return [page.contentModule, module.pageContent];
  }),
);
const docsContentByModule = Object.fromEntries(docsContentEntries);

const routes = [
  {
    path: "/",
    title: "Python 학습과 개인 자동화 스튜디오",
    description: "배우는 코드가 바로 실행되고, 실행한 코드가 자동화가 되는 local-first Python 스튜디오.",
    body: homeBody(),
    jsonLd: faqPageJsonLd(faqEntries),
  },
  {
    path: "/docs",
    title: "문서",
    description: "Codaro 아키텍처, 제품 원칙, 운영 기준 문서.",
    body: docsIndexBody(),
    jsonLd: collectionJsonLd("/docs", "Codaro 문서", "제품 사상, 아키텍처, 운영 기준 문서.", docsPages.map((page) => ({ name: page.title, url: page.url }))),
  },
  {
    path: "/packs",
    title: "공유 팩",
    description: "Codaro 커리큘럼과 자동화 recipe를 내려받아 로컬에서 시작하는 공유 갤러리.",
    body: packsBody(),
    jsonLd: collectionJsonLd("/packs", "Codaro 공유 팩", "커리큘럼과 자동화 recipe 공유 갤러리.", sharePacks.map((pack) => ({ name: pack.title, url: pack.manifestUrl }))),
  },
  ...docsPages.map((page) => ({
    path: sitePath(page.url),
    title: page.title,
    description: page.description,
    body: docBody(page, docsContentByModule[page.contentModule]),
    jsonLd: techArticleJsonLd(page),
  })),
  {
    path: "/docs/blog",
    title: "Codaro 소식",
    description: "Codaro 제품 방향, 출시 준비, 운영 기록을 담은 글.",
    body: blogIndexBody(posts),
    jsonLd: blogIndexJsonLd(posts),
  },
  ...postCategories.map((category) => {
    const categoryPosts = posts.filter((post) => post.category === category.slug);
    return {
      path: `/docs/blog/category/${category.slug}`,
      title: `${category.label} 글`,
      description: `${category.label} 카테고리의 Codaro 글 목록.`,
      body: postListBody(category.label, "Category", categoryPosts),
      jsonLd: collectionJsonLd(`/docs/blog/category/${category.slug}`, `${category.label} 글`, `${category.label} 카테고리의 Codaro 글 목록.`, categoryPosts.map((post) => ({ name: post.title, url: post.url }))),
    };
  }),
  ...postSeries.map((series) => {
    const seriesPosts = posts.filter((post) => post.series === series.slug);
    return {
      path: `/docs/blog/series/${series.slug}`,
      title: `${series.label} 시리즈`,
      description: `${series.label} 시리즈 글 목록.`,
      body: postListBody(series.label, "Series", seriesPosts),
      jsonLd: collectionJsonLd(`/docs/blog/series/${series.slug}`, `${series.label} 시리즈`, `${series.label} 시리즈 글 목록.`, seriesPosts.map((post) => ({ name: post.title, url: post.url }))),
    };
  }),
  ...posts.map((post) => ({
    path: sitePath(post.url),
    title: post.title,
    description: post.description,
    body: blogPostBody(post),
    jsonLd: blogPostJsonLd(post),
    image: `/brand/og/${post.slug}.png`,
    imageAlt: post.title,
    ogType: "article",
  })),
  {
    path: "/search",
    title: "검색",
    description: "Codaro 문서와 글을 한 번에 검색한다.",
    body: searchBody(),
  },
  {
    path: "/tools",
    title: "도구",
    description: "Codaro 공개 사이트의 브라우저 도구 모음.",
    body: toolsBody(),
  },
  ...tools.map((tool) => ({
    path: `/tools/${tool.slug}`,
    title: tool.title,
    description: tool.description,
    body: toolBody(tool),
  })),
];

for (const route of routes) {
  writeRoute(route.path, renderShell(route));
}

writeRoute("/404", renderShell({
  path: "/404",
  title: "페이지를 찾을 수 없음",
  description: "요청한 Codaro 페이지를 찾을 수 없습니다.",
  body: `<main class="pageShell narrow"><header class="pageHeader"><p class="eyebrow">404</p><h1>페이지를 찾을 수 없습니다</h1><p>경로가 바뀌었거나 아직 공개되지 않은 페이지입니다.</p></header></main>`,
}));
writeFileSync(resolve(buildRoot, "404.html"), renderShell({
  path: "/404",
  title: "페이지를 찾을 수 없음",
  description: "요청한 Codaro 페이지를 찾을 수 없습니다.",
  body: `<main class="pageShell narrow"><header class="pageHeader"><p class="eyebrow">404</p><h1>페이지를 찾을 수 없습니다</h1><p>경로가 바뀌었거나 아직 공개되지 않은 페이지입니다.</p></header></main>`,
}), "utf-8");

const redirects = [
  ["/blog", "/docs/blog"],
  ["/blog/category/codaro-news", "/docs/blog/category/codaro-news"],
  ["/blog/series/codaro-news", "/docs/blog/series/codaro-news"],
  ["/blog/codaro-public-launch", "/docs/blog/codaro-public-launch"],
  ["/blog/what-is-codaro", "/docs/blog/what-is-codaro"],
  ["/blog/codaro-public-launch-skeleton", "/docs/blog/codaro-public-launch"],
  ["/docs/blog/codaro-public-launch-skeleton", "/docs/blog/codaro-public-launch"],
];
for (const [from, to] of redirects) {
  writeRoute(from, redirectHtml(to));
}

console.log(`[react-prerender] routes=${routes.length} redirects=${redirects.length}`);

function sitePath(pathValue) {
  const value = pathValue || "/";
  const withoutBase = value.startsWith(basePath)
    ? value.slice(basePath.length) || "/"
    : value;
  return withoutBase.startsWith("/") ? withoutBase : `/${withoutBase}`;
}

function appPath(pathValue) {
  const path = sitePath(pathValue);
  return `${basePath}${path === "/" ? "" : path}`;
}

function siteUrl(pathValue) {
  return brand.toSiteUrl(pathValue);
}

function normalizeCanonical(path) {
  if (!path || path === "/") return `${brand.siteUrl}/`;
  const url = siteUrl(path);
  return url.endsWith("/") ? url : url;
}

function resolveRouteImage(route) {
  if (route.image) {
    return route.image.startsWith("http") ? route.image : brand.toSiteUrl(route.image);
  }
  return brand.toSiteUrl("/brand/codaro-og.png");
}

function resolveRouteOgType(route) {
  if (route.ogType) return route.ogType;
  if (route.path && (route.path.startsWith("/docs/blog/") && !route.path.includes("/category/") && !route.path.includes("/series/") && route.path !== "/docs/blog")) {
    return "article";
  }
  if (route.path && route.path.startsWith("/docs/") && route.path !== "/docs" && route.path !== "/docs/blog") {
    return "article";
  }
  return "website";
}

function renderShell(route) {
  const baseTitle = `${route.title} - Codaro`;
  const description = route.description || brand.description;
  const canonical = normalizeCanonical(route.path);
  const image = resolveRouteImage(route);
  const ogType = resolveRouteOgType(route);
  const imageAlt = route.imageAlt || `${route.title} — Codaro`;
  const twitterCard = image.endsWith(".png") || image.endsWith(".jpg") || image.endsWith(".jpeg") || image.endsWith(".webp") ? "summary_large_image" : "summary";
  const breadcrumb = buildBreadcrumb(route.path, route.title);
  const jsonLdBlocks = [breadcrumb, route.jsonLd]
    .filter(Boolean)
    .map((data) => `<script type="application/ld+json">${JSON.stringify(data)}</script>`)
    .join("");
  return shell
    .replace(/<html lang="[^"]*"/, `<html lang="ko"`)
    .replace(/<title>.*?<\/title>/s, `<title>${escapeHtml(baseTitle)}</title>`)
    .replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/s, `<meta name="description" content="${escapeHtml(description)}" />`)
    .replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/s, `<link rel="canonical" href="${escapeHtml(canonical)}" />`)
    .replace(/<link\s+rel="alternate"\s+hreflang="ko"\s+href="[^"]*"\s*\/?>/s, `<link rel="alternate" hreflang="ko" href="${escapeHtml(canonical)}" />`)
    .replace(/<link\s+rel="alternate"\s+hreflang="x-default"\s+href="[^"]*"\s*\/?>/s, `<link rel="alternate" hreflang="x-default" href="${escapeHtml(canonical)}" />`)
    .replace(/<meta\s+property="og:type"\s+content="[^"]*"\s*\/?>/s, `<meta property="og:type" content="${escapeHtml(ogType)}" />`)
    .replace(/<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/s, `<meta property="og:title" content="${escapeHtml(baseTitle)}" />`)
    .replace(/<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/s, `<meta property="og:description" content="${escapeHtml(description)}" />`)
    .replace(/<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/s, `<meta property="og:url" content="${escapeHtml(canonical)}" />`)
    .replace(/<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/s, `<meta property="og:image" content="${escapeHtml(image)}" />`)
    .replace(/<meta\s+property="og:image:secure_url"\s+content="[^"]*"\s*\/?>/s, `<meta property="og:image:secure_url" content="${escapeHtml(image)}" />`)
    .replace(/<meta\s+property="og:image:alt"\s+content="[^"]*"\s*\/?>/s, `<meta property="og:image:alt" content="${escapeHtml(imageAlt)}" />`)
    .replace(/<meta\s+name="twitter:card"\s+content="[^"]*"\s*\/?>/s, `<meta name="twitter:card" content="${escapeHtml(twitterCard)}" />`)
    .replace(/<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/s, `<meta name="twitter:title" content="${escapeHtml(baseTitle)}" />`)
    .replace(/<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/s, `<meta name="twitter:description" content="${escapeHtml(description)}" />`)
    .replace(/<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/?>/s, `<meta name="twitter:image" content="${escapeHtml(image)}" />`)
    .replace(/<meta\s+name="twitter:image:alt"\s+content="[^"]*"\s*\/?>/s, `<meta name="twitter:image:alt" content="${escapeHtml(imageAlt)}" />`)
    .replace(/<\/head>/, `${jsonLdBlocks}</head>`)
    .replace(/<div id="root"><\/div>/, `<div id="root">${route.body}</div>`);
}

function organizationRef() {
  return { "@id": `${brand.siteUrl}/#organization` };
}

function imageObject(url) {
  return { "@type": "ImageObject", url };
}

function techArticleJsonLd(page) {
  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: page.title,
    description: page.description || "",
    inLanguage: "ko",
    url: siteUrl(page.url),
    image: brand.toSiteUrl("/brand/codaro-character.png"),
    author: organizationRef(),
    publisher: organizationRef(),
    isPartOf: { "@id": `${brand.siteUrl}/#website` },
    mainEntityOfPage: { "@type": "WebPage", "@id": siteUrl(page.url) },
  };
}

function blogPostJsonLd(post) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description || "",
    inLanguage: "ko",
    url: siteUrl(post.url),
    datePublished: post.date ? `${post.date}T00:00:00Z` : undefined,
    dateModified: post.date ? `${post.date}T00:00:00Z` : undefined,
    image: post.cardPreview ? brand.toSiteUrl(post.cardPreview) : brand.toSiteUrl("/brand/codaro-character.png"),
    articleSection: post.categoryLabel,
    keywords: [post.categoryLabel, post.seriesLabel || post.series, "Codaro"].filter(Boolean).join(", "),
    author: organizationRef(),
    publisher: organizationRef(),
    isPartOf: { "@id": `${brand.siteUrl}/#website` },
    mainEntityOfPage: { "@type": "WebPage", "@id": siteUrl(post.url) },
  };
}

function blogIndexJsonLd(allPosts) {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Codaro 소식",
    description: "Codaro 제품 방향, 출시 준비, 운영 기록을 담은 글.",
    inLanguage: "ko",
    url: siteUrl("/docs/blog"),
    publisher: organizationRef(),
    isPartOf: { "@id": `${brand.siteUrl}/#website` },
    blogPost: allPosts.slice(0, 20).map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      url: siteUrl(post.url),
      datePublished: post.date ? `${post.date}T00:00:00Z` : undefined,
      description: post.description,
    })),
  };
}

function faqPageJsonLd(entries) {
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

function collectionJsonLd(path, name, description, items) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    inLanguage: "ko",
    url: siteUrl(path),
    isPartOf: { "@id": `${brand.siteUrl}/#website` },
    publisher: organizationRef(),
    hasPart: items.slice(0, 50).map((item) => ({
      "@type": "WebPage",
      name: item.name,
      url: item.url && item.url.startsWith("http") ? item.url : siteUrl(item.url || path),
    })),
  };
}

function buildBreadcrumb(path, title) {
  const segments = path.split("/").filter(Boolean);
  if (segments.length === 0) return null;
  const items = [{ name: "홈", url: siteUrl("/") }];
  let accum = "";
  segments.forEach((segment, index) => {
    accum += `/${segment}`;
    const isLast = index === segments.length - 1;
    items.push({
      name: isLast ? title : segmentLabel(segment),
      url: siteUrl(accum),
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

function segmentLabel(segment) {
  const map = {
    docs: "문서",
    blog: "Codaro 소식",
    packs: "공유 팩",
    tools: "도구",
    search: "검색",
    category: "카테고리",
    series: "시리즈",
  };
  return map[segment] || segment;
}

function redirectHtml(targetPath) {
  const target = appPath(targetPath);
  const absoluteTarget = siteUrl(targetPath);
  return `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="refresh" content="0; url=${escapeHtml(target)}" />
    <link rel="canonical" href="${escapeHtml(absoluteTarget)}" />
    <title>Codaro 이동 중</title>
    <script>window.location.replace(${JSON.stringify(target)});</script>
  </head>
  <body>
    <p><a href="${escapeHtml(target)}">Codaro 페이지로 이동</a></p>
  </body>
</html>`;
}

function writeRoute(routePath, html) {
  const cleanPath = sitePath(routePath);
  const targetDir = cleanPath === "/" ? buildRoot : resolve(buildRoot, cleanPath.slice(1));
  mkdirSync(targetDir, { recursive: true });
  writeFileSync(resolve(targetDir, "index.html"), html, "utf-8");
  if (cleanPath === "/") {
    writeFileSync(shellPath, html, "utf-8");
  }
}

function homeBody() {
  return `<main><section class="heroSection"><div class="heroCopy"><p class="eyebrow">React 기반 GitHub Pages / Local-first / Python runtime</p><h1>배우는 코드가 실행되고, 실행한 코드가 자동화가 된다.</h1><p class="heroLead">Codaro는 Python 학습, 노트북 셀 실행, 개인 자동화를 하나의 로컬 제품 흐름으로 묶는다.</p><div class="heroActions"><a class="primaryButton" href="${brand.launcherDownloadUrl}">CodaroLauncher.exe</a><a class="secondaryButton" href="${appPath("/docs")}">문서 보기</a><a class="secondaryButton" href="${appPath("/packs")}">공유 팩</a><a class="textLink" href="${appPath("/docs/blog")}">Codaro 소식</a></div><div class="releaseLinks" aria-label="릴리즈 검증 링크"><a href="${brand.launcherChecksumUrl}">체크섬</a><a href="${brand.launcherSbomUrl}">SBOM</a><a href="${brand.releaseManifestUrl}">manifest</a><a href="${brand.releaseUrl}">GitHub Releases</a></div></div><div class="heroPanel"><div class="panelTop"><span></span><span></span><span></span><strong>codaro.local</strong></div><div class="studioPreview"><aside><b>채팅</b><b>에디터</b><b>커리큘럼</b><b>자동화</b></aside><div><p class="chatBubble">CSV 정리법을 배우고 매주 리포트로 만들고 싶다.</p><p class="chatBubble muted">학습 셀과 dry-run 자동화 계획을 만들었다.</p><pre>import pandas as pd
df = pd.read_csv("expenses.csv")</pre><div class="runResult">실행 가능 / 검증 가능 / 태스크로 승격 가능</div></div></div></div></section><section class="contentBand faqBand" aria-labelledby="home-faq-title"><div class="sectionIntro"><p class="eyebrow">FAQ</p><h2 id="home-faq-title">자주 묻는 질문</h2><p>Jupyter·marimo와의 차이, AI 사용 여부, 라이선스, 프라이버시까지 — 처음 Codaro를 접할 때 가장 많이 나오는 8개 질문을 한 곳에 정리했다.</p></div><div class="faqList">${faqEntries.map((entry, index) => `<details class="faqItem"${index === 0 ? " open" : ""}><summary>${escapeHtml(entry.question)}</summary><p>${escapeHtml(entry.answer)}</p></details>`).join("")}</div></section></main>`;
}

function packsBody() {
  return `<main class="pageShell"><header class="pageHeader"><p class="eyebrow">Share packs</p><h1>공유 팩 갤러리</h1><p>커리큘럼과 자동화 recipe를 manifest URL로 받아 Codaro 로컬 저장소에 설치합니다.</p></header><section class="shareHowTo"><div><h2>로컬에서 시작하는 방법</h2><p>Codaro 앱의 왼쪽 사이드바에서 공유 팩을 열고 아래 codaroPack.yaml URL을 붙여넣은 뒤 검사와 설치를 진행하세요.</p></div></section><div class="packGrid">${sharePacks.map((pack) => `<article class="packCard"><div class="packCardHeader"><strong>${escapeHtml(pack.id)}</strong><span>${escapeHtml(pack.version)}</span></div><h2>${escapeHtml(pack.title)}</h2><p>${escapeHtml(pack.description)}</p><div class="packMeta"><span>커리큘럼 ${pack.contents.curricula}</span><span>자동화 ${pack.contents.automations}</span><span>${escapeHtml(pack.license)}</span></div><code>${escapeHtml(pack.manifestUrl)}</code><div class="downloadActions"><a class="primaryButton" href="${escapeHtml(pack.manifestUrl)}">manifest 열기</a><a class="secondaryButton" href="${escapeHtml(pack.packRootUrl)}">파일 보기</a></div></article>`).join("")}</div></main>`;
}

function docsIndexBody() {
  const groups = groupBy(docsPages, "sectionLabel");
  return `<main class="pageShell"><header class="pageHeader"><p class="eyebrow">Documentation</p><h1>Codaro 문서</h1><p>제품 사상, 아키텍처, 운영 기준을 한 곳에서 확인한다.</p></header><div class="docGroupGrid">${Object.entries(groups).map(([label, pages]) => `<section class="docGroup"><h2>${escapeHtml(label)}</h2><div class="linkList">${pages.map((page) => `<a href="${appPath(page.url)}"><strong>${escapeHtml(page.title)}</strong><span>${escapeHtml(page.description)}</span></a>`).join("")}</div></section>`).join("")}</div></main>`;
}

function docBody(page, content) {
  return `<main class="articleLayout"><aside class="articleRail"><a href="${appPath("/docs")}">문서 전체</a></aside><article class="proseArticle"><p class="eyebrow">${escapeHtml(page.sectionLabel)}</p><h1>${escapeHtml(page.title)}</h1><p class="articleDescription">${escapeHtml(page.description)}</p><div class="htmlContent">${content?.html || ""}</div></article></main>`;
}

function blogIndexBody(blogPosts) {
  return postListBody("Codaro 소식", "Writing", blogPosts);
}

function postListBody(title, eyebrow, blogPosts) {
  return `<main class="pageShell"><header class="pageHeader"><p class="eyebrow">${escapeHtml(eyebrow)}</p><h1>${escapeHtml(title)}</h1><p>제품 방향, 공개 출시 준비, 운영 판단을 긴 글로 남긴다.</p></header><div class="postGrid">${blogPosts.map(postCard).join("")}</div></main>`;
}

function postCard(post) {
  return `<article class="postCard"><img src="${escapeHtml(post.cardPreview)}" alt="" /><div><p>${escapeHtml(post.categoryLabel)}</p><h2>${escapeHtml(post.title)}</h2><span>${escapeHtml(post.description)}</span><a href="${appPath(post.url)}">읽기</a></div></article>`;
}

function blogPostBody(post) {
  return `<main class="articleLayout compact"><aside class="articleRail"><a href="${appPath("/docs/blog")}">Codaro 소식</a><a href="${appPath(`/docs/blog/category/${post.category}`)}">${escapeHtml(post.categoryLabel)}</a></aside><article class="proseArticle"><p class="eyebrow">${escapeHtml(post.categoryLabel)}</p><h1>${escapeHtml(post.title)}</h1><p class="articleDescription">${escapeHtml(post.description)}</p><div class="articleMeta"><span>${escapeHtml(post.date)}</span><span>${escapeHtml(post.seriesLabel || post.series)}</span></div><div class="htmlContent">${post.html}</div></article></main>`;
}

function searchBody() {
  return `<main class="pageShell"><header class="pageHeader"><p class="eyebrow">Search</p><h1>Codaro 검색</h1><p>문서, 운영 기준, 블로그 글을 같은 색인에서 찾는다.</p></header><div class="searchResults">${searchEntries.slice(0, 12).map((entry) => `<a href="${appPath(entry.url)}"><span>${entry.kind === "writing" ? "글" : "문서"}</span><strong>${escapeHtml(entry.title)}</strong><p>${escapeHtml(entry.description)}</p></a>`).join("")}</div></main>`;
}

function toolsBody() {
  const groups = groupBy(tools, "category");
  return `<main class="pageShell"><header class="pageHeader"><p class="eyebrow">Tools</p><h1>브라우저 도구</h1><p>공개 사이트에서 함께 제공하는 작은 유틸리티 목록.</p></header><div class="toolGroups">${Object.entries(groups).map(([category, group]) => `<section><h2>${escapeHtml(category)}</h2><div class="toolGrid">${group.map((tool) => `<a class="toolCard" href="${appPath(`/tools/${tool.slug}`)}"><span>${escapeHtml(tool.icon)}</span><strong>${escapeHtml(tool.title)}</strong><p>${escapeHtml(tool.description)}</p></a>`).join("")}</div></section>`).join("")}</div></main>`;
}

function toolBody(tool) {
  return `<main class="pageShell narrow"><header class="pageHeader"><p class="eyebrow">${escapeHtml(tool.category)}</p><h1>${escapeHtml(tool.title)}</h1><p>${escapeHtml(tool.description)}</p></header><section class="toolDetail"><h2>React 전환 기준 도구 표면</h2><p>이 경로는 React 기반 GitHub Pages 라우트로 유지된다. 개별 도구의 고급 상호작용은 다음 개선 단위로 붙일 수 있게 URL과 메타데이터를 보존했다.</p><div class="tagRow">${tool.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}</div></section></main>`;
}

function groupBy(items, key) {
  return items.reduce((groups, item) => {
    const group = item[key] || "기타";
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {});
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
