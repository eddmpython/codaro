import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { docsPages } from "../src/lib/generated/docsNav.js";
import { posts, postCategories, postSeries } from "../src/lib/generated/posts.js";
import { searchEntries } from "../src/lib/generated/searchIndex.js";
import { sharePacks } from "../src/lib/sharePacks.js";
import { tools } from "../src/lib/tools/registry.js";
import { brand } from "../src/lib/brand.js";
import { curriculumLessons } from "../src/lib/generated/curriculum.js";
import { buildLearningResourceJsonLd } from "../src/lib/seo.js";
import { buildBreadcrumbJsonLd } from "../src/lib/seo.js";
import { designSurfaceForPath } from "../src/lib/publicRouting.js";
import { homeMeta, learnMeta } from "../src/lib/publicMeta.js";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { createServer } from "vite";

const __dirname = dirname(fileURLToPath(import.meta.url));
const landingRoot = resolve(__dirname, "..");
const buildRoot = resolve(landingRoot, "build");
const shellPath = resolve(buildRoot, "index.html");
const shell = readFileSync(shellPath, "utf-8");
const interactiveRunShellPath = resolve(buildRoot, "run", "index.html");
const interactiveRunShell = existsSync(interactiveRunShellPath)
  ? readFileSync(interactiveRunShellPath, "utf-8")
  : null;
const basePath = "/codaro";

const docsContentEntries = await Promise.all(
  docsPages.map(async (page) => {
    const module = await import(`../src/lib/generated/docsPages/${page.contentModule}.js`);
    return [page.contentModule, module.pageContent];
  }),
);
const docsContentByModule = Object.fromEntries(docsContentEntries);

// 홈은 App.jsx의 HomePage를 단일 SSOT로 React SSR한다.
// node는 JSX를 못 읽으므로 Vite ssrLoadModule로 온더플라이 트랜스파일해 로드한다.
const viteServer = await createServer({
  root: resolve(__dirname, ".."),
  configFile: resolve(__dirname, "../vite.config.js"),
  server: { middlewareMode: true },
  appType: "custom",
  logLevel: "silent",
});
const { default: App } = await viteServer.ssrLoadModule("/src/App.jsx");
const { CodaroThemeProvider } = await viteServer.ssrLoadModule("/src/components/codaroThemeProvider.jsx");
const publicLessonRoutes = await Promise.all(curriculumLessons.map(async (lesson) => {
  const moduleUrl = pathToFileURL(resolve(
    landingRoot,
    `src/lib/generated/curriculumLessons/${lesson.contentModule}.js`,
  )).href;
  const loaded = await import(moduleUrl);
  const payload = loaded.default;
  return {
    path: lesson.route,
    title: payload.seo.title || payload.title,
    description: payload.seo.description || payload.direction,
    image: "/brand/codaro-og.png",
    imageAlt: `${payload.title} Codaro 공개 레슨`,
    ogType: "article",
    routeData: { kind: "public-lesson", lesson: payload },
    jsonLd: buildLearningResourceJsonLd(payload),
  };
}));

const routes = [
  {
    path: "/",
    ...homeMeta,
  },
  {
    path: "/learn",
    ...learnMeta,
  },
  ...publicLessonRoutes,
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
    routeData: {
      kind: "docs-page",
      contentModule: page.contentModule,
      content: docsContentByModule[page.contentModule],
    },
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
  if (interactiveRunShell && route.routeData?.kind === "public-lesson") {
    writeRoute(route.path, renderInteractiveLessonShell(route));
    continue;
  }
  route.body = renderApplication(route.path, route.routeData || null);
  writeRoute(route.path, renderShell(route));
}

const notFoundShell = renderShell({
  path: "/404",
  title: "페이지를 찾을 수 없음",
  description: "요청한 Codaro 페이지를 찾을 수 없습니다.",
  body: renderApplication("/404", null),
});
writeRoute("/404", notFoundShell);
writeFileSync(resolve(buildRoot, "404.html"), notFoundShell, "utf-8");

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

await viteServer.close();

function renderApplication(path, routeData) {
  return renderToString(
    createElement(
      CodaroThemeProvider,
      { initialSurface: designSurfaceForPath(path) },
      createElement(App, { initialPath: path, initialRouteData: routeData }),
    ),
  );
}

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
  const breadcrumb = buildBreadcrumbJsonLd(route.path, route.title);
  const jsonLdBlocks = [
    breadcrumb ? `<script id="codaro-breadcrumb-jsonld" type="application/ld+json">${scriptSafeJson(breadcrumb)}</script>` : "",
    route.jsonLd ? `<script id="codaro-route-jsonld" type="application/ld+json">${scriptSafeJson(route.jsonLd)}</script>` : "",
  ].join("");
  const routeDataScript = route.routeData
    ? `<script id="codaro-route-data" type="application/json">${scriptSafeJson(route.routeData)}</script>`
    : "";
  return shell
    .replace(/<html lang="[^"]*"/, () => `<html lang="ko"`)
    .replace(/<title>.*?<\/title>/s, () => `<title>${escapeHtml(baseTitle)}</title>`)
    .replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/s, () => `<meta name="description" content="${escapeHtml(description)}" />`)
    .replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/s, () => `<link rel="canonical" href="${escapeHtml(canonical)}" />`)
    .replace(/<link\s+rel="alternate"\s+hreflang="ko"\s+href="[^"]*"\s*\/?>/s, () => `<link rel="alternate" hreflang="ko" href="${escapeHtml(canonical)}" />`)
    .replace(/<link\s+rel="alternate"\s+hreflang="x-default"\s+href="[^"]*"\s*\/?>/s, () => `<link rel="alternate" hreflang="x-default" href="${escapeHtml(canonical)}" />`)
    .replace(/<meta\s+property="og:type"\s+content="[^"]*"\s*\/?>/s, () => `<meta property="og:type" content="${escapeHtml(ogType)}" />`)
    .replace(/<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/s, () => `<meta property="og:title" content="${escapeHtml(baseTitle)}" />`)
    .replace(/<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/s, () => `<meta property="og:description" content="${escapeHtml(description)}" />`)
    .replace(/<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/s, () => `<meta property="og:url" content="${escapeHtml(canonical)}" />`)
    .replace(/<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/s, () => `<meta property="og:image" content="${escapeHtml(image)}" />`)
    .replace(/<meta\s+property="og:image:secure_url"\s+content="[^"]*"\s*\/?>/s, () => `<meta property="og:image:secure_url" content="${escapeHtml(image)}" />`)
    .replace(/<meta\s+property="og:image:alt"\s+content="[^"]*"\s*\/?>/s, () => `<meta property="og:image:alt" content="${escapeHtml(imageAlt)}" />`)
    .replace(/<meta\s+name="twitter:card"\s+content="[^"]*"\s*\/?>/s, () => `<meta name="twitter:card" content="${escapeHtml(twitterCard)}" />`)
    .replace(/<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/s, () => `<meta name="twitter:title" content="${escapeHtml(baseTitle)}" />`)
    .replace(/<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/s, () => `<meta name="twitter:description" content="${escapeHtml(description)}" />`)
    .replace(/<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/?>/s, () => `<meta name="twitter:image" content="${escapeHtml(image)}" />`)
    .replace(/<meta\s+name="twitter:image:alt"\s+content="[^"]*"\s*\/?>/s, () => `<meta name="twitter:image:alt" content="${escapeHtml(imageAlt)}" />`)
    .replace(/<\/head>/, () => `${jsonLdBlocks}${routeDataScript}</head>`)
    .replace(/<div id="root"><\/div>/, () => `<div id="root">${route.body}</div>`);
}

function renderInteractiveLessonShell(route) {
  const lesson = route.routeData.lesson;
  const baseTitle = `${route.title} - Codaro`;
  const description = route.description || lesson.direction || brand.description;
  const canonical = normalizeCanonical(route.path);
  const image = resolveRouteImage(route);
  const imageAlt = route.imageAlt || `${route.title} · Codaro`;
  const runtimeTier = lesson.runtimeTier === "local" ? "local" : "browser";
  const breadcrumb = buildBreadcrumbJsonLd(route.path, route.title);
  const initialDocument = lessonInitialDocumentHtml(lesson);
  const metadata = [
    `<meta name="description" content="${escapeHtml(description)}" />`,
    `<meta name="codaro-runtime-tier" content="web" />`,
    `<meta name="codaro-lesson-runtime-tier" content="${runtimeTier}" />`,
    `<meta name="codaro-canonical-lesson" content="${escapeHtml(`${lesson.track}/${lesson.id}`)}" />`,
    `<link rel="canonical" href="${escapeHtml(canonical)}" />`,
    `<link rel="alternate" hreflang="ko" href="${escapeHtml(canonical)}" />`,
    `<link rel="alternate" hreflang="x-default" href="${escapeHtml(canonical)}" />`,
    `<meta property="og:type" content="article" />`,
    `<meta property="og:title" content="${escapeHtml(baseTitle)}" />`,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
    `<meta property="og:url" content="${escapeHtml(canonical)}" />`,
    `<meta property="og:image" content="${escapeHtml(image)}" />`,
    `<meta property="og:image:secure_url" content="${escapeHtml(image)}" />`,
    `<meta property="og:image:alt" content="${escapeHtml(imageAlt)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtml(baseTitle)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(description)}" />`,
    `<meta name="twitter:image" content="${escapeHtml(image)}" />`,
    `<meta name="twitter:image:alt" content="${escapeHtml(imageAlt)}" />`,
    breadcrumb ? `<script id="codaro-breadcrumb-jsonld" type="application/ld+json">${scriptSafeJson(breadcrumb)}</script>` : "",
    route.jsonLd ? `<script id="codaro-route-jsonld" type="application/ld+json">${scriptSafeJson(route.jsonLd)}</script>` : "",
    `<script id="codaro-route-data" type="application/json">${scriptSafeJson(route.routeData)}</script>`,
    `<script id="codaro-lesson-initial-data" type="application/json">${scriptSafeJson(lesson)}</script>`,
    `<style id="codaro-lesson-initial-style">${lessonInitialDocumentCss()}</style>`,
  ].join("");

  return interactiveRunShell
    .replace(/<html lang="[^"]*"/, () => `<html lang="ko"`)
    .replace(/<title>.*?<\/title>/s, () => `<title>${escapeHtml(baseTitle)}</title>`)
    .replace(/<\/head>/, () => `${metadata}</head>`)
    .replace(/<div id="root"><\/div>/, () => `<div id="root">${initialDocument}</div>`);
}

function lessonInitialDocumentHtml(lesson) {
  const firstSection = lesson.sections?.[0] || null;
  const localRuntime = lesson.runtimeTier === "local";
  const outcomes = Array.isArray(lesson.outcome) ? lesson.outcome.slice(0, 4) : [];
  const points = lesson.intro?.points?.length
    ? lesson.intro.points.slice(0, 4)
    : lesson.intro?.benefits?.slice(0, 4) || [];
  const snippet = firstSection?.snippet || firstSection?.exercise?.starterCode || "";
  const prompt = firstSection?.exercise?.prompt || firstSection?.goal || "";
  return [
    `<main class="lessonInitialDocument" data-initial-lesson-ref="${escapeHtml(`${lesson.track}/${lesson.id}`)}" data-public-lesson="${escapeHtml(`${lesson.track}/${lesson.id}`)}">`,
    `<header class="lessonInitialHeader">`,
    `<span>${escapeHtml(lesson.domainLabel || "Codaro Learn")} · ${escapeHtml(String(lesson.estimatedMinutes || 0))}분</span>`,
    `<h1>${escapeHtml(lesson.title)}</h1>`,
    `<p>${escapeHtml(lesson.intro?.direction || lesson.seo?.description || "")}</p>`,
    `</header>`,
    `<div class="lessonInitialRuntime" data-runtime-tier="${localRuntime ? "local" : "browser"}">`,
    `<strong>${localRuntime ? "Web에서 개념과 코드 학습" : "Web에서 바로 편집·실행"}</strong>`,
    `<span>${localRuntime ? "운영체제 권한이 필요한 실행은 Local에서 이어집니다." : "실행 뒤 강한 검증이 자동으로 이어집니다."}</span>`,
    `</div>`,
    `<section class="lessonInitialOutcomes" aria-label="학습 목표">${outcomes.map((outcome) => `<span>${escapeHtml(outcome)}</span>`).join("")}</section>`,
    `<section class="lessonInitialBody">`,
    `<div>`,
    `<span class="lessonInitialIndex">01</span>`,
    `<h2>${escapeHtml(firstSection?.title || "첫 실습")}</h2>`,
    firstSection?.goal ? `<p>${escapeHtml(firstSection.goal)}</p>` : "",
    points.length ? `<ul>${points.map((point) => `<li>${escapeHtml(point)}</li>`).join("")}</ul>` : "",
    `</div>`,
    `<div class="lessonInitialExercise">`,
    `<span>직접 해보기</span>`,
    prompt ? `<strong>${escapeHtml(prompt)}</strong>` : "",
    snippet ? `<pre><code>${escapeHtml(snippet)}</code></pre>` : "",
    `<small>편집기를 준비하고 있습니다.</small>`,
    `</div>`,
    `</section>`,
    `</main>`,
  ].join("");
}

function lessonInitialDocumentCss() {
  return `
    .lessonInitialDocument{min-height:100vh;overflow:auto;padding:56px max(24px,calc((100vw - 960px)/2));background:var(--color-background-body,light-dark(#f5f6f8,#151619));color:var(--color-text-primary,light-dark(#18191d,#f5f6f8));font-family:var(--font-family-body,system-ui,sans-serif)}
    .lessonInitialHeader{display:grid;max-width:720px;gap:12px}
    .lessonInitialHeader>span,.lessonInitialIndex{color:var(--color-text-accent,light-dark(#6d2857,#e4a9d2));font:700 12px/18px var(--font-family-code,monospace)}
    .lessonInitialHeader h1{margin:0;font:700 32px/40px var(--font-family-heading,system-ui,sans-serif)}
    .lessonInitialHeader p{margin:0;max-width:64ch;color:var(--color-text-secondary,light-dark(#5d626d,#aeb3bd));font-size:16px;line-height:26px}
    .lessonInitialRuntime{display:flex;flex-wrap:wrap;gap:8px 16px;margin-top:24px;padding:12px 14px;border-left:3px solid var(--color-border-brand,light-dark(#8a356d,#e4a9d2));background:var(--color-background-muted,light-dark(#eceff3,#202226));font-size:13px;line-height:20px}
    .lessonInitialRuntime span{color:var(--color-text-secondary,light-dark(#5d626d,#aeb3bd))}
    .lessonInitialOutcomes{display:flex;flex-wrap:wrap;gap:8px;margin-top:24px;padding-block:16px;border-block:1px solid var(--color-border,light-dark(#d9dde3,#34373d))}
    .lessonInitialOutcomes span{padding:4px 8px;border-radius:6px;background:var(--color-background-muted,light-dark(#eceff3,#202226));font-size:13px;line-height:20px}
    .lessonInitialBody{display:grid;grid-template-columns:minmax(0,1fr) minmax(320px,.8fr);gap:48px;margin-top:40px}
    .lessonInitialBody h2{margin:6px 0 10px;font-size:24px;line-height:32px}
    .lessonInitialBody p,.lessonInitialBody li{font-size:16px;line-height:26px}
    .lessonInitialExercise{display:grid;align-content:start;gap:10px;padding:18px;border:1px solid var(--color-border-emphasized,light-dark(#b7bdc7,#535760));border-radius:8px;background:var(--color-background-card,light-dark(#fff,#1b1c20))}
    .lessonInitialExercise>span{color:var(--color-text-accent,light-dark(#6d2857,#e4a9d2));font-size:12px;font-weight:700}
    .lessonInitialExercise pre{overflow:auto;margin:2px 0 0;padding:16px;border-radius:6px;background:var(--color-syntax-background,light-dark(#f8f9fa,#17181b));font-size:14px;line-height:22px}
    .lessonInitialExercise small{color:var(--color-text-secondary,light-dark(#5d626d,#aeb3bd));font-size:12px;line-height:18px}
    @media(max-width:700px){.lessonInitialDocument{padding:32px 20px}.lessonInitialHeader h1{font-size:26px;line-height:34px}.lessonInitialBody{grid-template-columns:1fr;gap:24px;margin-top:28px}}
  `;
}

function scriptSafeJson(value) {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
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
}function packsBody() {
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
  const kindLabel = (kind) => ({ lesson: "레슨", writing: "글", docs: "문서" })[kind] || "문서";
  return `<main class="pageShell"><header class="pageHeader"><p class="eyebrow">Search</p><h1>Codaro 검색</h1><p>공개 레슨, 문서, 운영 기준, 블로그 글을 같은 색인에서 찾는다.</p></header><div class="searchResults">${searchEntries.slice(0, 12).map((entry) => `<a href="${appPath(entry.url)}"><span>${kindLabel(entry.kind)}</span><strong>${escapeHtml(entry.title)}</strong><p>${escapeHtml(entry.description)}</p></a>`).join("")}</div></main>`;
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
