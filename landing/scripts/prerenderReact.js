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
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";

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

// 홈은 App.jsx의 HomePage를 단일 SSOT로 React SSR한다(수기 homeBody 대신).
// node는 JSX를 못 읽으므로 Vite ssrLoadModule로 온더플라이 트랜스파일해 로드한다.
const viteServer = await createServer({
  root: resolve(__dirname, ".."),
  configFile: resolve(__dirname, "../vite.config.js"),
  server: { middlewareMode: true },
  appType: "custom",
  logLevel: "silent",
});
const { HomePage } = await viteServer.ssrLoadModule("/src/pages/home.jsx");
const { LearnPage } = await viteServer.ssrLoadModule("/src/pages/learn.jsx");

const routes = [
  {
    path: "/",
    title: "Python 학습과 개인 자동화 스튜디오",
    description: "배우는 코드가 바로 실행되고, 실행한 코드가 자동화가 되는 local-first Python 스튜디오.",
    body: renderToStaticMarkup(createElement(HomePage)),
    jsonLd: faqPageJsonLd(faqEntries),
  },
  {
    path: "/learn",
    title: "브라우저에서 배우는 Python",
    description: "472개 공개 레슨을 브라우저에서. 설치 없이 배우고, 로컬로 완전하게 이어지는 Codaro 커리큘럼.",
    body: renderToStaticMarkup(createElement(LearnPage)),
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

await viteServer.close();

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
  const surfaces = [
    { label: "채팅", title: "요청을 작업으로 정리", copy: "학습 목표와 반복 업무를 셀, 검증, 자동화 후보로 나눠 시작한다.", mini: "> 매주 지출 CSV를 리포트로\n→ 학습셀 · 검증셀 · 태스크 분리" },
    { label: "에디터", title: "로컬에서 바로 실행", copy: "Python과 Markdown 셀을 일반 파일처럼 유지하고 실행 결과를 옆에서 확인한다.", mini: "# %% Python\ndf.groupby(\"week\").sum()" },
    { label: "커리큘럼", title: "학습을 실행 단위로 저장", copy: "설명, 예측, 실행, 검증이 같은 학습 카드 안에서 끊기지 않는다.", mini: "lesson: pandas-groupby\n예측 → 실행 → 검증 → 변주" },
    { label: "자동화", title: "검증된 흐름을 태스크로 승격", copy: "반복 가능한 셀과 스크립트를 dry-run 계획, 태스크, 리포트로 키운다.", mini: "@every_5m\ntask: weekly_report → ok" },
  ];
  const releaseLinks = [
    { href: brand.launcherChecksumUrl, label: "체크섬" },
    { href: brand.releaseManifestUrl, label: "manifest" },
    { href: brand.pythonRuntimeUrl, label: "Python runtime" },
    { href: brand.pythonRuntimeChecksumUrl, label: "runtime checksum" },
    { href: brand.launcherSbomUrl, label: "SBOM" },
    { href: brand.releaseUrl, label: "GitHub Releases" },
  ];
  const trustItems = [
    { title: "로컬 우선", copy: "코드·노트북·산출물은 모두 내 PC에 남는다." },
    { title: "검증 가능한 배포", copy: "launcher 체크섬·manifest·SBOM을 함께 공개한다." },
    { title: "AI는 선택적", copy: "학습·실행·자동화는 AI 없이도 완전 동작한다." },
  ];
  const hero = `<section class="heroSection" aria-labelledby="home-title"><p class="eyebrow">LOCAL-FIRST · PYTHON STUDIO</p><h1 id="home-title">배운 코드가 그대로 실행되고, 실행이 곧 자동화가 된다.</h1><p class="heroLead">채팅·에디터·커리큘럼·자동화를 하나의 로컬 <span class="latin">Python</span> 작업대에서 잇습니다.</p><div class="heroActions"><a class="primaryButton" href="${brand.launcherDownloadUrl}">Codaro.exe 다운로드</a><a class="secondaryButton" href="${brand.repoUrl}" rel="noopener noreferrer" target="_blank">GitHub에서 보기</a></div><p class="heroReassure">Windows x64 · 런타임 포함 · 오프라인 실행 · 무료</p><div class="heroFrameWrap"><img class="heroMascot" src="${brand.avatarHeroUrl}" alt="Codaro 마스코트" width="236" height="236" /><div class="productFrame" aria-label="Codaro 로컬 실행 미리보기"><div class="frameChrome"><span class="dots" aria-hidden="true"><span></span><span></span><span></span></span><span>codaro.local — spend_report.py</span><span class="runBtn">검증 실행</span></div><div class="frameBody workField"><div class="codeLine"><span class="tok-c"># %% Python</span></div><div class="codeLine">import pandas as pd</div><div class="codeLine">df = pd.<span class="tok-fn">read_csv</span>(<span class="tok-s">"spend.csv"</span>)</div><div class="codeLine">report = df.<span class="tok-fn">groupby</span>(<span class="tok-s">"week"</span>).<span class="tok-fn">sum</span>()</div><div class="runRow"><span>▸ 실행</span><span class="runBar" aria-hidden="true"></span></div><div class="outputLine"><span class="tok-c"># week&nbsp;&nbsp;&nbsp;spend</span>\n2025-W21&nbsp;&nbsp;&nbsp;412,900</div></div><span class="verifiedPill">검증 완료</span></div></div></section>`;
  const trustBand = `<section class="trustBand" aria-label="Codaro 신뢰 신호"><div class="trustStrip"><span>GitHub 공개 저장소</span><span>SHA256 · SBOM 검증 배포</span><span>Windows x64 단일 실행 파일</span><span>463개 공개 커리큘럼 레슨</span></div></section>`;
  const productBand = `<section class="contentBand productBand"><div class="sectionIntro"><p class="eyebrow">// 네 개의 표면, 하나의 문서 모델</p><h2>학습과 자동화가 갈라지지 않는다.</h2><p>채팅, 에디터, 커리큘럼, 자동화가 같은 셀 흐름을 공유합니다. 맥락이 끊기지 않습니다.</p></div><div class="surfaceGrid">${surfaces.map((surface) => `<article class="surfaceCard"><p class="surfaceLabel">${escapeHtml(surface.label)}</p><h3>${escapeHtml(surface.title)}</h3><span>${escapeHtml(surface.copy)}</span><div class="surfaceMini">${escapeHtml(surface.mini)}</div></article>`).join("")}</div></section>`;
  const seeItWork = `<section class="contentBand seeItWork" aria-labelledby="home-see-title"><div class="sectionIntro"><p class="eyebrow">// 직접 보기</p><h2 id="home-see-title">한 화면에서 배우고 · 실행하고 · 승격한다.</h2><p>학습 셀을 실행 가능한 리포트 자동화로 전환하는 실제 작업 흐름.</p></div><div class="editorShell" aria-label="Codaro 로컬 에디터 미리보기"><div class="editorChrome"><div class="windowDots" aria-hidden="true"><span></span><span></span><span></span></div><strong>codaro.local</strong></div><div class="editorWorkspace"><aside class="editorSidebar"><div class="sidebarBrand"><img src="${brand.avatarSmallUrl}" alt="" width="34" height="34" /><div><strong>Codaro</strong><span>local studio</span></div></div><a href="${appPath("/")}">채팅</a><a class="active" href="${appPath("/")}">에디터</a><a href="${appPath("/")}">커리큘럼</a><a href="${appPath("/")}">자동화</a></aside><section class="editorCanvas"><div class="editorTopbar"><div><p>오늘의 작업</p><strong>CSV 정리를 주간 리포트 자동화로</strong></div></div><div class="workspaceGrid"><div class="chatPane"><p class="paneLabel">채팅</p><div class="message user">매주 지출 CSV를 리포트로 만들고 싶어요.</div><div class="message system">학습 셀, 검증 셀, dry-run 태스크로 흐름을 분리했어요.</div></div><div class="notebookPane"><div class="cellHeader"><span># %% Python</span><strong>preview</strong></div><pre>import pandas as pd
df = pd.read_csv("spend.csv")
report = df.groupby("week").sum()</pre><div class="runResult">실행 성공 · 검증 가능 · 태스크 승격 가능</div></div></div></section></div></div></section>`;
  const flowSection = `<section class="contentBand flowSection" aria-labelledby="home-flow-title"><div class="sectionIntro"><p class="eyebrow">// 작동 방식</p><h2 id="home-flow-title">배운 코드가 자동화가 되기까지.</h2></div><div class="flowGrid"><article class="flowStep"><p class="flowNum">01 배운다</p><h3>커리큘럼 셀</h3><p>예측 → 실행 → 오류 → 검증 흐름을 한 학습 카드 안에서.</p></article><article class="flowStep"><p class="flowNum">02 실행한다</p><h3>로컬 런타임</h3><p>percent format <span class="latin">.py</span>를 내 PC에서 그대로 실행하고 결과를 확인.</p></article><article class="flowStep"><p class="flowNum">03 승격한다</p><h3>dry-run 태스크</h3><p>검증된 셀을 반복 가능한 개인 자동화로 키운다.</p><img class="flowMascot" src="${brand.avatarFaceUrl}" alt="" /></article></div></section>`;
  const releaseSection = `<section class="splitSection releaseSection"><div><p class="eyebrow">// 검증</p><h2>다운로드 전에 직접 검증할 수 있다.</h2><p>학습과 실행의 기준은 브라우저 샌드박스가 아니라 당신의 로컬 Python 환경입니다. 릴리즈의 체크섬·manifest·SBOM으로 받기 전에 확인하세요.</p><div class="trustList">${trustItems.map((item) => `<article class="trustItem"><div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.copy)}</p></div></article>`).join("")}</div></div><div><div class="checksumPanel" aria-label="릴리즈 자산"><div class="head"><span class="dot" aria-hidden="true"></span>GitHub Releases / latest</div><p class="sha">Codaro.exe          <span class="tok-c"># 단일 실행 파일</span>\nCodaro.exe.sha256   <span class="tok-c"># SHA256 체크섬</span>\ncodaro.spdx.json    <span class="tok-c"># SBOM</span>\nrelease-manifest.json <span class="tok-c"># 버전 핀</span>\npython-runtime…zip  <span class="tok-c"># 관리형 런타임</span></p><div class="checksumChips" aria-label="릴리즈 검증 링크">${releaseLinks.map((link) => `<a href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a>`).join("")}</div></div></div></section>`;
  const brandMoment = `<section class="contentBand"><div class="brandMoment"><div class="brandField workField" aria-hidden="true"></div><div class="brandMomentArt"><img src="${brand.avatarHeroUrl}" alt="Codaro 마스코트" /></div><div class="brandMomentBody"><h2>코드를 배우는 일이 외롭지 않도록.</h2><p>Codaro는 혼자 공부하는 사람이 끝까지 가도록 돕는 로컬 작업대입니다. 배운 코드가 멈추지 않고 내 일을 대신할 때까지.</p><a href="${brand.repoUrl}" rel="noopener noreferrer" target="_blank">GitHub에서 보기</a></div></div></section>`;
  const faqSection = `<section class="contentBand faqBand" aria-labelledby="home-faq-title"><div class="sectionIntro"><p class="eyebrow">// FAQ</p><h2 id="home-faq-title">자주 묻는 질문</h2><p>Jupyter·marimo와의 차이, AI 사용 여부, 라이선스, 프라이버시까지 — 처음 Codaro를 접할 때 가장 많이 나오는 8개 질문을 한 곳에 정리했다.</p></div><div class="faqList">${faqEntries.map((entry, index) => `<details class="faqItem"${index === 0 ? " open" : ""}><summary>${escapeHtml(entry.question)}</summary><p>${escapeHtml(entry.answer)}</p></details>`).join("")}</div></section>`;
  const finalCta = `<section class="contentBand finalCta" aria-label="지금 시작하기"><img src="${brand.avatarFaceUrl}" alt="" width="96" height="96" /><h2>지금, 배운 코드를 자동화로 바꿔보세요.</h2><div class="heroActions"><a class="primaryButton" href="${brand.launcherDownloadUrl}">Codaro.exe 다운로드</a><a class="secondaryButton" href="${brand.repoUrl}" rel="noopener noreferrer" target="_blank">GitHub에서 보기</a></div></section>`;
  return `<main class="homePage">${hero}${trustBand}${productBand}${seeItWork}${flowSection}${releaseSection}${brandMoment}${faqSection}${finalCta}</main>`;
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
