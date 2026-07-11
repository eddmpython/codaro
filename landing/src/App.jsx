import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Boxes,
  Check,
  CheckCircle2,
  Download,
  FileCheck2,
  Library,
  Moon,
  PackageOpen,
  Play,
  Search,
  Settings2,
  ShieldCheck,
  Star,
  Sun,
  Terminal,
  Workflow,
} from "lucide-react";
import { brand, basePath } from "./lib/brand.js";
import { docsPages } from "./lib/generated/docsNav.js";
import { posts, postCategories, postSeries } from "./lib/generated/posts.js";
import { sharePacks } from "./lib/sharePacks.js";
import { faqEntries } from "./lib/faq.js";
import { tools } from "./lib/tools/registry.js";
import { HomePage } from "./pages/home.jsx";

const docsModules = import.meta.glob("./lib/generated/docsPages/*.js");


const proofItems = [
  {
    title: "로컬 런타임 기준",
    copy: "학습과 실행의 기준을 브라우저 샌드박스가 아니라 사용자의 Python 환경에 둔다.",
  },
  {
    title: "문서 모델 하나",
    copy: "채팅, 에디터, 커리큘럼, 자동화가 같은 셀 흐름을 공유해 맥락 손실을 줄인다.",
  },
  {
    title: "실행에서 자동화까지",
    copy: "한 번 검증한 코드를 데모로 끝내지 않고 반복 가능한 개인 업무로 끌어올린다.",
  },
];

const navItems = [
  { href: "/", label: "홈" },
  { href: "/docs/blog", label: "소식" },
  { href: "/packs", label: "팩" },
  { href: "/tools", label: "도구" },
  { href: "/search", label: "검색" },
];


function GithubIcon({ size = 17 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" role="img" aria-hidden="true">
      <path d="M12 .297a12 12 0 0 0-3.792 23.39c.6.112.82-.26.82-.577v-2.234c-3.338.726-4.043-1.416-4.043-1.416-.546-1.386-1.333-1.755-1.333-1.755-1.09-.745.083-.73.083-.73 1.204.084 1.838 1.237 1.838 1.237 1.07 1.833 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.605-2.665-.303-5.467-1.332-5.467-5.93 0-1.31.468-2.381 1.236-3.221-.124-.303-.536-1.523.117-3.176 0 0 1.008-.322 3.301 1.23A11.5 11.5 0 0 1 12 5.59c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.655 1.653.243 2.873.12 3.176.77.84 1.234 1.911 1.234 3.221 0 4.609-2.807 5.624-5.48 5.921.43.371.823 1.102.823 2.222v3.293c0 .32.216.694.825.576A12 12 0 0 0 12 .297Z" />
    </svg>
  );
}

function YoutubeIcon({ size = 17 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" role="img" aria-hidden="true">
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31.4 31.4 0 0 0 0 12a31.4 31.4 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31.4 31.4 0 0 0 24 12a31.4 31.4 0 0 0-.5-5.8ZM9.6 15.6V8.4L15.8 12l-6.2 3.6Z" />
    </svg>
  );
}

function ThreadsIcon({ size = 17 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" role="img" aria-hidden="true">
      <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.598.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 3.02.142c-.126-.742-.375-1.332-.75-1.757-.513-.586-1.308-.883-2.359-.89h-.029c-.844 0-1.992.232-2.721 1.32L7.734 7.847c.98-1.454 2.568-2.256 4.478-2.256h.044c3.194.02 5.097 1.975 5.287 5.388.108.046.216.094.321.143 1.49.7 2.58 1.761 3.154 3.07.797 1.82.871 4.79-1.548 7.158-1.85 1.81-4.094 2.628-7.277 2.65Zm1.003-11.69c-.242 0-.487.007-.739.021-1.836.103-2.98.946-2.916 2.143.067 1.256 1.452 1.839 2.784 1.767 1.224-.065 2.818-.543 3.086-3.71a10.5 10.5 0 0 0-2.215-.221z" />
    </svg>
  );
}

function CoffeeIcon({ size = 17 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" role="img" aria-hidden="true">
      <path d="M2 3h16a2 2 0 0 1 2 2v3h1a3 3 0 0 1 0 6h-1v1a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V3Zm18 7v2h1a1 1 0 1 0 0-2h-1ZM4 5v10a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3V5H4Z" />
    </svg>
  );
}

const externalLinks = [
  { href: brand.repoUrl, label: "GitHub", icon: GithubIcon },
  { href: "https://www.youtube.com/@eddmpython", label: "YouTube", icon: YoutubeIcon },
  { href: "https://www.threads.net/@eddmpython", label: "Threads", icon: ThreadsIcon },
  { href: "https://buymeacoffee.com/eddmpython", label: "후원하기", icon: CoffeeIcon },
];

function appPath(path = "/") {
  return brand.appPath(path);
}

function stripBase(pathname) {
  if (!pathname || pathname === basePath) return "/";
  if (basePath && pathname.startsWith(`${basePath}/`)) {
    return pathname.slice(basePath.length) || "/";
  }
  return pathname || "/";
}

function normalizePath(pathname) {
  const value = stripBase(pathname).replace(/\/index\.html$/, "");
  return value.length > 1 ? value.replace(/\/$/, "") : "/";
}

function getBrowserPath() {
  if (typeof window === "undefined") return "/";
  return normalizePath(window.location.pathname);
}

function getInitialTheme() {
  if (typeof window === "undefined") return "dark";
  const stored = window.localStorage.getItem("codaroLandingTheme");
  if (stored === "dark" || stored === "light") return stored;
  return "dark";
}

function groupBy(items, key) {
  return items.reduce((groups, item) => {
    const group = item[key] || "기타";
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {});
}

function updateMeta(meta) {
  if (typeof document === "undefined") return;
  const title = meta.title ? `${meta.title} - Codaro` : "Codaro - Python 학습과 개인 자동화 스튜디오";
  const description = meta.description || brand.description;
  const canonical = brand.toSiteUrl(meta.url || "/");
  document.documentElement.lang = "ko";
  document.title = title;
  setMeta("description", description);
  setMeta("theme-color", document.documentElement.dataset.theme === "light" ? "#fafafa" : "#18181b");
  setLink("canonical", canonical);
  setProperty("og:type", meta.type || "website");
  setProperty("og:title", title);
  setProperty("og:description", description);
  setProperty("og:url", canonical);
  setProperty("og:image", brand.toSiteUrl("/brand/codaro-character.png"));
  setMeta("twitter:card", "summary");
  setMeta("twitter:title", title);
  setMeta("twitter:description", description);
}

function setMeta(name, content) {
  let tag = document.querySelector(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("name", name);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

function setProperty(property, content) {
  let tag = document.querySelector(`meta[property="${property}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("property", property);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

function setLink(rel, href) {
  let tag = document.querySelector(`link[rel="${rel}"]`);
  if (!tag) {
    tag = document.createElement("link");
    tag.setAttribute("rel", rel);
    document.head.appendChild(tag);
  }
  tag.setAttribute("href", href);
}

function App() {
  const [path, setPath] = useState(getBrowserPath);
  const [themeMode, setThemeMode] = useState(getInitialTheme);
  const route = useMemo(() => resolveRoute(path), [path]);

  useEffect(() => {
    const onPopState = () => setPath(getBrowserPath());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = themeMode;
    window.localStorage.setItem("codaroLandingTheme", themeMode);
    setMeta("theme-color", themeMode === "light" ? "#fafafa" : "#18181b");
  }, [themeMode]);

  useEffect(() => {
    updateMeta(route.meta);
  }, [route.meta]);

  useEffect(() => {
    const redirected = legacyRedirect(path);
    if (redirected) {
      window.location.replace(appPath(redirected));
    }
  }, [path]);

  function navigate(event, href) {
    if (!href.startsWith(basePath || "/")) return;
    const url = new URL(href, window.location.origin);
    if (url.origin !== window.location.origin) return;
    event.preventDefault();
    window.history.pushState({}, "", href);
    setPath(getBrowserPath());
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  return (
    <div className="appFrame">
      {route.hideChrome ? null : (
        <Header
          onNavigate={navigate}
          currentPath={path}
          themeMode={themeMode}
          onToggleTheme={() => setThemeMode((current) => (current === "dark" ? "light" : "dark"))}
        />
      )}
      {route.element}
      {route.hideChrome ? null : <Footer />}
    </div>
  );
}

function Header({ onNavigate, themeMode, onToggleTheme }) {
  return (
    <>
      <a
        className="floatBrand"
        href={appPath("/")}
        onClick={(event) => onNavigate(event, appPath("/"))}
        aria-label="Codaro 홈"
      >
        <img src={brand.avatarSmallUrl} alt="" width="30" height="30" />
        <span>Codaro</span>
      </a>
      <div className="floatControls" aria-label="컨트롤">
        {externalLinks.map((item) => {
          const Icon = item.icon;
          return (
            <a
              className="iconButton"
              href={item.href}
              key={item.label}
              title={item.label}
              aria-label={item.label}
              rel="noopener noreferrer"
              target="_blank"
            >
              <Icon size={17} aria-hidden="true" />
            </a>
          );
        })}
        <a className="downloadChip" href={brand.launcherDownloadUrl}>
          <Download size={15} aria-hidden="true" />
          다운로드
        </a>
        <button
          className="iconButton"
          type="button"
          onClick={onToggleTheme}
          title={themeMode === "dark" ? "라이트 모드" : "다크 모드"}
          aria-label={themeMode === "dark" ? "라이트 모드로 전환" : "다크 모드로 전환"}
        >
          {themeMode === "dark" ? <Sun size={17} aria-hidden="true" /> : <Moon size={17} aria-hidden="true" />}
        </button>
      </div>
    </>
  );
}

function Footer() {
  return (
    <footer className="siteFooter">
      <div className="footerGrid">
        <div className="footerBrand">
          <a className="brandMark" href={appPath("/")}>
            <img src={brand.avatarSmallUrl} alt="" width="32" height="32" />
            <span>Codaro</span>
          </a>
          <p>배우는 코드가 곧 실행되는 자동화가 되는 로컬 Python 작업대.</p>
          <div className="socialBar" aria-label="외부 링크">
            {externalLinks.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  className="iconButton"
                  href={item.href}
                  key={item.label}
                  title={item.label}
                  aria-label={item.label}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <Icon size={17} aria-hidden="true" />
                </a>
              );
            })}
          </div>
        </div>
        <div className="footerCol">
          <h4>제품</h4>
          <ul>
            <li><a href={brand.launcherDownloadUrl}>다운로드</a></li>
            <li><a href={appPath("/packs")}>공유 팩</a></li>
            <li><a href={appPath("/tools")}>도구</a></li>
            <li><a href={appPath("/docs/blog")}>소식</a></li>
          </ul>
        </div>
        <div className="footerCol">
          <h4>검증·신뢰</h4>
          <ul>
            <li><a href={brand.repoUrl} rel="noopener noreferrer" target="_blank">GitHub</a></li>
            <li><a href={brand.releaseUrl} rel="noopener noreferrer" target="_blank">Releases</a></li>
            <li><a href={brand.launcherChecksumUrl}>체크섬</a></li>
            <li><a href={brand.launcherSbomUrl}>SBOM</a></li>
          </ul>
        </div>
        <div className="footerCol">
          <h4>탐색</h4>
          <ul>
            <li><a href={appPath("/docs/blog")}>Codaro 소식</a></li>
            <li><a href={appPath("/search")}>검색</a></li>
            <li><a href="https://buymeacoffee.com/eddmpython" rel="noopener noreferrer" target="_blank">후원하기</a></li>
          </ul>
        </div>
      </div>
      <div className="footerBottom">
        <span>© Codaro · Non-Commercial Source 1.0</span>
        <span>로컬 우선 · 오프라인 실행</span>
      </div>
    </footer>
  );
}

function resolveRoute(path) {
  if (path === "/") {
    return {
      meta: {
        title: "Python 학습과 개인 자동화 스튜디오",
        description: "배우는 코드가 바로 실행되고, 실행한 코드가 자동화가 되는 local-first Python 스튜디오.",
        url: "/",
      },
      element: <HomePage />,
    };
  }
  if (path === "/docs") return docsIndexRoute();
  if (path === "/packs") return packsRoute();
  if (path === "/docs/blog") return blogIndexRoute();
  if (path.startsWith("/docs/blog/category/")) {
    return blogCategoryRoute(path.replace("/docs/blog/category/", ""));
  }
  if (path.startsWith("/docs/blog/series/")) {
    return blogSeriesRoute(path.replace("/docs/blog/series/", ""));
  }
  if (path.startsWith("/docs/blog/")) {
    return blogPostRoute(path.replace("/docs/blog/", ""));
  }
  if (path === "/search") return searchRoute();
  if (path === "/tools") return toolsRoute();
  if (path.startsWith("/tools/")) return toolRoute(path.replace("/tools/", ""));
  if (path.startsWith("/docs/")) return docsPageRoute(path.replace("/docs/", ""));
  return {
    meta: {
      title: "페이지를 찾을 수 없음",
      description: "요청한 Codaro 페이지를 찾을 수 없습니다.",
      url: path,
    },
    element: <NotFoundPage />,
  };
}

function legacyRedirect(path) {
  if (path === "/blog") return "/docs/blog";
  if (path.startsWith("/blog/category/")) return path.replace("/blog/category/", "/docs/blog/category/");
  if (path.startsWith("/blog/series/")) return path.replace("/blog/series/", "/docs/blog/series/");
  if (path === "/blog/codaro-public-launch-skeleton") return "/docs/blog/codaro-public-launch";
  if (path === "/docs/blog/codaro-public-launch-skeleton") return "/docs/blog/codaro-public-launch";
  if (path.startsWith("/blog/")) return path.replace("/blog/", "/docs/blog/");
  return null;
}




function packsRoute() {
  return {
    meta: {
      title: "공유 팩",
      description: "Codaro 커리큘럼과 자동화 recipe를 내려받아 로컬에서 시작하는 공유 갤러리.",
      url: "/packs",
    },
    element: <PacksPage />,
  };
}

function PacksPage() {
  return (
    <main className="pageShell">
      <PageHeader
        eyebrow="Share packs"
        title="공유 팩 갤러리"
        copy="커리큘럼과 자동화 recipe를 manifest URL로 받아 Codaro 로컬 저장소에 설치합니다."
      />
      <section className="shareHowTo">
        <PackageOpen size={22} aria-hidden="true" />
        <div>
          <h2>로컬에서 시작하는 방법</h2>
          <p>
            Codaro 앱의 왼쪽 사이드바에서 공유 팩을 열고, 아래 `codaroPack.yaml` URL을 붙여넣은 뒤
            검사와 설치를 진행하세요. 설치된 커리큘럼은 나만의 커리큘럼으로 열리고, 자동화 recipe는 dry-run 태스크로 등록됩니다.
          </p>
        </div>
      </section>
      <div className="packGrid">
        {sharePacks.map((pack) => (
          <article className="packCard" key={`${pack.id}@${pack.version}`}>
            <div className="packCardHeader">
              <PackageOpen size={22} aria-hidden="true" />
              <span>{pack.version}</span>
            </div>
            <h2>{pack.title}</h2>
            <p>{pack.description}</p>
            <div className="packMeta">
              <span>커리큘럼 {pack.contents.curricula}</span>
              <span>자동화 {pack.contents.automations}</span>
              <span>{pack.license}</span>
            </div>
            <code>{pack.manifestUrl}</code>
            <div className="downloadActions">
              <a className="primaryButton" href={pack.manifestUrl}>
                manifest 열기
                <Download size={16} aria-hidden="true" />
              </a>
              <a className="secondaryButton" href={pack.packRootUrl}>
                파일 보기
              </a>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}

function docsIndexRoute() {
  return {
    meta: {
      title: "문서",
      description: "Codaro 아키텍처, 제품 원칙, 운영 기준 문서.",
      url: "/docs",
    },
    element: <DocsIndexPage />,
  };
}

function DocsIndexPage() {
  const groups = groupBy(docsPages, "sectionLabel");
  return (
    <main className="pageShell">
      <PageHeader eyebrow="Documentation" title="Codaro 문서" copy="제품 사상, 아키텍처, 운영 기준을 한 곳에서 확인한다." />
      <div className="docGroupGrid">
        {Object.entries(groups).map(([label, pages]) => (
          <section className="docGroup" key={label}>
            <h2>{label}</h2>
            <div className="linkList">
              {pages.map((page) => (
                <a href={appPath(page.url)} key={page.path}>
                  <strong>{page.title}</strong>
                  <span>{page.description}</span>
                </a>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}

function docsPageRoute(slug) {
  const page = docsPages.find((candidate) => candidate.path === slug);
  if (!page) {
    return {
      meta: { title: "문서를 찾을 수 없음", description: "요청한 Codaro 문서를 찾을 수 없습니다.", url: `/docs/${slug}` },
      element: <NotFoundPage />,
    };
  }
  return {
    meta: { title: page.title, description: page.description, url: page.url, type: "article" },
    element: <DocsPage page={page} />,
  };
}

function DocsPage({ page }) {
  const [content, setContent] = useState(null);
  const related = docsPages.filter((candidate) => candidate.sectionLabel === page.sectionLabel).slice(0, 12);

  useEffect(() => {
    let cancelled = false;
    const loader = docsModules[`./lib/generated/docsPages/${page.contentModule}.js`];
    if (!loader) {
      setContent({ html: "<p>문서 내용을 불러오지 못했습니다.</p>" });
      return () => {
        cancelled = true;
      };
    }
    loader().then((module) => {
      if (!cancelled) setContent(module.pageContent);
    });
    return () => {
      cancelled = true;
    };
  }, [page.contentModule]);

  return (
    <main className="articleLayout">
      <aside className="articleRail">
        <a href={appPath("/docs")}>문서 전체</a>
        {related.map((item) => (
          <a href={appPath(item.url)} className={item.path === page.path ? "active" : ""} key={item.path}>
            {item.title}
          </a>
        ))}
      </aside>
      <article className="proseArticle">
        <p className="eyebrow">{page.sectionLabel}</p>
        <h1>{page.title}</h1>
        <p className="articleDescription">{page.description}</p>
        <HTMLContent html={content?.html || "<p>문서 내용을 불러오는 중입니다.</p>"} />
      </article>
    </main>
  );
}

function blogIndexRoute() {
  return {
    meta: {
      title: "Codaro 소식",
      description: "Codaro 제품 방향, 출시 준비, 운영 기록을 담은 글.",
      url: "/docs/blog",
    },
    element: <BlogIndexPage />,
  };
}

function BlogIndexPage() {
  const [featuredPost, ...restPosts] = posts;
  return (
    <main className="pageShell blogShell">
      <PageHeader
        eyebrow="Codaro 소식"
        title="학습, 실행, 자동화가 어떻게 하나의 제품이 되는지 기록한다."
        copy="Codaro 소식은 단순 공지가 아니라 제품 판단, 출시 준비, 로컬 런타임 운영 기준을 남기는 공개 기록이다."
      />
      {featuredPost ? <FeaturedPost post={featuredPost} /> : null}
      <TaxonomyBar categories={postCategories} series={postSeries} />
      <PostGrid posts={restPosts.length ? restPosts : posts} />
    </main>
  );
}

function blogCategoryRoute(category) {
  const matched = posts.filter((post) => post.category === category);
  const label = matched[0]?.categoryLabel || category;
  return {
    meta: {
      title: `${label} 글`,
      description: `${label} 카테고리의 Codaro 글 목록.`,
      url: `/docs/blog/category/${category}`,
    },
    element: (
      <main className="pageShell">
        <PageHeader eyebrow="Category" title={label} copy="같은 카테고리의 공개 글을 모았다." />
        <PostGrid posts={matched} />
      </main>
    ),
  };
}

function blogSeriesRoute(series) {
  const matched = posts.filter((post) => post.series === series);
  const label = matched[0]?.seriesLabel || series;
  return {
    meta: {
      title: `${label} 시리즈`,
      description: `${label} 시리즈 글 목록.`,
      url: `/docs/blog/series/${series}`,
    },
    element: (
      <main className="pageShell">
        <PageHeader eyebrow="Series" title={label} copy="같은 흐름으로 이어지는 글을 모았다." />
        <PostGrid posts={matched} />
      </main>
    ),
  };
}

function blogPostRoute(slug) {
  const post = posts.find((candidate) => candidate.slug === slug);
  if (!post) {
    return {
      meta: { title: "글을 찾을 수 없음", description: "요청한 Codaro 글을 찾을 수 없습니다.", url: `/docs/blog/${slug}` },
      element: <NotFoundPage />,
    };
  }
  return {
    meta: { title: post.title, description: post.description, url: post.url, type: "article" },
    element: <BlogPostPage post={post} />,
  };
}

function BlogPostPage({ post }) {
  return (
    <main className="articleLayout compact">
      <aside className="articleRail">
        <a href={appPath("/docs/blog")}>Codaro 소식</a>
        <a href={appPath(`/docs/blog/category/${post.category}`)}>{post.categoryLabel}</a>
        <a href={appPath(`/docs/blog/series/${post.series}`)}>{post.seriesLabel || post.series}</a>
      </aside>
      <article className="proseArticle">
        <div className="articleHero">
          <p className="eyebrow">{post.categoryLabel}</p>
          <h1>{post.title}</h1>
          <p className="articleDescription">{post.description}</p>
          <div className="articleMeta">
            <span>{post.date}</span>
            <span>{post.seriesLabel || post.series}</span>
          </div>
        </div>
        <HTMLContent html={post.html} />
      </article>
    </main>
  );
}

function FeaturedPost({ post }) {
  return (
    <section className="featuredPost" aria-label="대표 글">
      <img src={post.cardPreview} alt="" />
      <div className="featuredPostBody">
        <p className="eyebrow">Featured writing</p>
        <h2>{post.title}</h2>
        <span>{post.description}</span>
        <div className="featuredMeta">
          <span>{post.categoryLabel}</span>
          <span>{post.date}</span>
          <span>{post.seriesLabel || post.series}</span>
        </div>
        <a href={appPath(post.url)}>
          대표 글 읽기
          <ArrowRight size={16} aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}

function TaxonomyBar({ categories, series }) {
  return (
    <div className="taxonomyBar">
      {categories.map((category) => (
        <a href={appPath(`/docs/blog/category/${category.slug}`)} key={category.slug}>
          {category.label}
        </a>
      ))}
      {series.map((item) => (
        <a href={appPath(`/docs/blog/series/${item.slug}`)} key={item.slug}>
          {item.label} 시리즈
        </a>
      ))}
    </div>
  );
}

function PostGrid({ posts: visiblePosts }) {
  if (!visiblePosts.length) return <p className="emptyState">아직 공개된 글이 없습니다.</p>;
  return (
    <div className="postGrid">
      {visiblePosts.map((post) => (
        <article className="postCard" key={post.slug}>
          <img src={post.cardPreview} alt="" />
          <div>
            <p>{post.categoryLabel}</p>
            <h2>{post.title}</h2>
            <span>{post.description}</span>
            <a href={appPath(post.url)}>
              읽기
              <ArrowRight size={15} aria-hidden="true" />
            </a>
          </div>
        </article>
      ))}
    </div>
  );
}

function searchRoute() {
  return {
    meta: {
      title: "검색",
      description: "Codaro 문서와 글을 한 번에 검색한다.",
      url: "/search",
    },
    element: <SearchPage />,
  };
}

function SearchPage() {
  const initialQuery = typeof window === "undefined" ? "" : new URLSearchParams(window.location.search).get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [searchEntries, setSearchEntries] = useState(null);

  useEffect(() => {
    let cancelled = false;
    import("./lib/generated/searchIndex.js").then((module) => {
      if (!cancelled) setSearchEntries(module.searchEntries);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const normalized = query.trim().toLowerCase();
  const entries = searchEntries || [];
  const results = normalized
    ? entries.filter((entry) => `${entry.title} ${entry.description} ${entry.text}`.toLowerCase().includes(normalized)).slice(0, 30)
    : entries.slice(0, 12);

  return (
    <main className="pageShell">
      <PageHeader eyebrow="Search" title="Codaro 검색" copy="문서, 운영 기준, 블로그 글을 같은 색인에서 찾는다." />
      <label className="searchBox">
        <Search size={19} aria-hidden="true" />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="검색어를 입력하세요" />
      </label>
      <div className="searchResults">
        {searchEntries === null ? <p className="emptyState">검색 색인을 불러오는 중입니다…</p> : null}
        {results.map((entry) => (
          <a href={appPath(entry.url)} key={`${entry.kind}-${entry.url}`}>
            <span>{entry.kind === "writing" ? "글" : "문서"}</span>
            <strong>{entry.title}</strong>
            <p>{entry.description}</p>
          </a>
        ))}
      </div>
    </main>
  );
}

function toolsRoute() {
  return {
    meta: {
      title: "도구",
      description: "Codaro 공개 사이트의 브라우저 도구 모음.",
      url: "/tools",
    },
    element: <ToolsPage />,
  };
}

function ToolsPage() {
  const groups = groupBy(tools, "category");
  return (
    <main className="pageShell">
      <PageHeader eyebrow="Tools" title="브라우저 도구" copy="공개 사이트에서 함께 제공하는 작은 유틸리티 목록." />
      <div className="toolGroups">
        {Object.entries(groups).map(([category, group]) => (
          <section key={category}>
            <h2>{category}</h2>
            <div className="toolGrid">
              {group.map((tool) => (
                <a className="toolCard" href={appPath(`/tools/${tool.slug}`)} key={tool.slug}>
                  <span>{tool.icon}</span>
                  <strong>{tool.title}</strong>
                  <p>{tool.description}</p>
                </a>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}

function toolRoute(slug) {
  const tool = tools.find((candidate) => candidate.slug === slug);
  if (!tool) {
    return {
      meta: { title: "도구를 찾을 수 없음", description: "요청한 도구를 찾을 수 없습니다.", url: `/tools/${slug}` },
      element: <NotFoundPage />,
    };
  }
  return {
    meta: { title: tool.title, description: tool.description, url: `/tools/${tool.slug}` },
    element: <ToolDetailPage tool={tool} />,
  };
}

function ToolDetailPage({ tool }) {
  return (
    <main className="pageShell narrow">
      <PageHeader eyebrow={tool.category} title={tool.title} copy={tool.description} />
      <section className="toolDetail">
        <Boxes size={28} aria-hidden="true" />
        <h2>React 전환 기준 도구 표면</h2>
        <p>
          이 경로는 React 기반 GitHub Pages 라우트로 유지된다. 개별 도구의 고급 상호작용은
          공개 사이트 도구 표면의 다음 개선 단위로 붙일 수 있게 URL과 메타데이터를 보존했다.
        </p>
        <div className="tagRow">
          {tool.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      </section>
    </main>
  );
}

function PageHeader({ eyebrow, title, copy }) {
  return (
    <header className="pageHeader">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p>{copy}</p>
    </header>
  );
}

function HTMLContent({ html }) {
  return <div className="htmlContent" dangerouslySetInnerHTML={{ __html: html }} />;
}

function NotFoundPage() {
  return (
    <main className="pageShell narrow">
      <PageHeader eyebrow="404" title="페이지를 찾을 수 없습니다" copy="경로가 바뀌었거나 아직 공개되지 않은 페이지입니다." />
      <a className="primaryButton" href={appPath("/")}>
        홈으로 이동
        <ArrowRight size={16} aria-hidden="true" />
      </a>
    </main>
  );
}

export default App;
