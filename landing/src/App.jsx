import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Boxes,
  CheckCircle2,
  Download,
  FileCheck2,
  GitBranch,
  Library,
  Moon,
  PackageOpen,
  PanelLeft,
  Play,
  Rss,
  Search,
  Settings2,
  ShieldCheck,
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

const docsModules = import.meta.glob("./lib/generated/docsPages/*.js");

const surfaces = [
  {
    label: "채팅",
    title: "요청을 작업으로 정리",
    copy: "학습 목표와 반복 업무를 셀, 검증, 자동화 후보로 나눠 시작한다.",
    icon: BookOpen,
  },
  {
    label: "에디터",
    title: "로컬에서 바로 실행",
    copy: "Python과 Markdown 셀을 일반 파일처럼 유지하고 실행 결과를 옆에서 확인한다.",
    icon: Terminal,
  },
  {
    label: "커리큘럼",
    title: "학습을 실행 단위로 저장",
    copy: "설명, 예측, 실행, 검증이 같은 학습 카드 안에서 끊기지 않는다.",
    icon: CheckCircle2,
  },
  {
    label: "자동화",
    title: "검증된 흐름을 태스크로 승격",
    copy: "반복 가능한 셀과 스크립트를 dry-run 계획, 태스크, 리포트로 키운다.",
    icon: Workflow,
  },
];

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
  { href: "/docs", label: "문서" },
  { href: "/packs", label: "팩" },
  { href: "/docs/blog", label: "소식" },
  { href: "/tools", label: "도구" },
  { href: "/search", label: "검색" },
];

const releaseLinks = [
  { href: brand.launcherChecksumUrl, label: "체크섬" },
  { href: brand.releaseManifestUrl, label: "manifest" },
  { href: brand.pythonRuntimeUrl, label: "Python runtime" },
  { href: brand.pythonRuntimeChecksumUrl, label: "runtime checksum" },
  { href: brand.launcherSbomUrl, label: "SBOM" },
  { href: brand.releaseUrl, label: "GitHub Releases" },
];

const externalLinks = [
  { href: brand.repoUrl, label: "GitHub", icon: GitBranch },
  { href: brand.releaseUrl, label: "Releases", icon: Download },
  { href: brand.toSiteUrl("/feed.xml"), label: "RSS", icon: Rss },
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
      <Header
        onNavigate={navigate}
        currentPath={path}
        themeMode={themeMode}
        onToggleTheme={() => setThemeMode((current) => (current === "dark" ? "light" : "dark"))}
      />
      {route.element}
      <Footer />
    </div>
  );
}

function Header({ onNavigate, currentPath, themeMode, onToggleTheme }) {
  return (
    <header className="siteHeader">
      <a className="brandMark" href={appPath("/")} onClick={(event) => onNavigate(event, appPath("/"))}>
        <img src={brand.mascotUrl} alt="" width="36" height="36" />
        <span>Codaro</span>
      </a>
      <nav aria-label="주요 경로">
        {navItems.map((item) => {
          const active = currentPath === item.href || (item.href !== "/" && currentPath.startsWith(item.href));
          return (
            <a
              key={item.href}
              href={appPath(item.href)}
              aria-current={active ? "page" : undefined}
              onClick={(event) => onNavigate(event, appPath(item.href))}
            >
              {item.label}
            </a>
          );
        })}
      </nav>
      <div className="headerActions" aria-label="외부 링크">
        {externalLinks.map((item) => {
          const Icon = item.icon;
          return (
            <a className="iconButton" href={item.href} key={item.label} title={item.label} aria-label={item.label}>
              <Icon size={17} aria-hidden="true" />
            </a>
          );
        })}
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
    </header>
  );
}

function Footer() {
  return (
    <footer className="siteFooter">
      <div>
        <strong>Codaro</strong>
        <p>Python 학습, 실행, 개인 자동화를 하나의 로컬 흐름으로 잇는 스튜디오.</p>
      </div>
      <div className="footerLinks">
        <a href={appPath("/docs")}>문서</a>
        <a href={appPath("/docs/blog")}>Codaro 소식</a>
        <a href={brand.repoUrl}>저장소</a>
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

function HomePage() {
  return (
    <main className="homePage">
      <section className="heroSection" aria-labelledby="home-title">
        <div className="heroCopy">
          <div className="heroKicker">
            <span>Local editor</span>
            <span>Python runtime</span>
            <span>GitHub Pages</span>
          </div>
          <h1 id="home-title">배우고 실행하고 자동화하는 로컬 Python 스튜디오.</h1>
          <p className="heroLead">
            Codaro는 Python 학습을 실행 가능한 셀로 만들고, 검증된 흐름을 개인 자동화로 키운다.
            채팅, 에디터, 커리큘럼, 자동화가 하나의 로컬 작업공간 안에서 이어진다.
          </p>
          <div className="heroActions">
            <a className="primaryButton" href={brand.launcherDownloadUrl}>
              <Download size={17} aria-hidden="true" />
              Codaro.exe
            </a>
            <a className="secondaryButton" href={appPath("/docs")}>
              <BookOpen size={17} aria-hidden="true" />
              문서 보기
            </a>
            <a className="textLink" href={appPath("/docs/blog")}>
              Codaro 소식
              <ArrowRight size={16} aria-hidden="true" />
            </a>
          </div>
          <div className="heroMetrics" aria-label="Codaro 핵심 표면">
            <span>실행형 커리큘럼</span>
            <span>로컬 셀 런타임</span>
            <span>dry-run 자동화</span>
          </div>
          <div className="heroProofGrid" aria-label="Codaro 핵심 장점">
            {proofItems.map((item) => (
              <div className="proofTile" key={item.title}>
                <strong>{item.title}</strong>
                <span>{item.copy}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="editorShell" aria-label="Codaro 로컬 에디터 미리보기">
          <div className="editorChrome">
            <div className="windowDots" aria-hidden="true">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <strong>codaro.local</strong>
            <button type="button" aria-label="설정">
              <Settings2 size={15} aria-hidden="true" />
            </button>
          </div>
          <div className="editorWorkspace">
            <aside className="editorSidebar">
              <div className="sidebarBrand">
                <img src={brand.mascotUrl} alt="" width="34" height="34" />
                <div>
                  <strong>Codaro</strong>
                  <span>local studio</span>
                </div>
              </div>
              <a className="active" href={appPath("/docs")}>
                <PanelLeft size={16} aria-hidden="true" />
                워크스페이스
              </a>
              <a href={appPath("/packs")}>
                <PackageOpen size={16} aria-hidden="true" />
                공유 팩
              </a>
              <a href={appPath("/tools")}>
                <Workflow size={16} aria-hidden="true" />
                자동화
              </a>
            </aside>
            <section className="editorCanvas">
              <div className="editorTopbar">
                <div>
                  <p>오늘의 작업</p>
                  <strong>학습 셀을 실행 가능한 리포트 자동화로 전환</strong>
                </div>
                <button type="button">
                  <Play size={15} aria-hidden="true" />
                  검증 실행
                </button>
              </div>
              <div className="workspaceGrid">
                <div className="chatPane">
                  <p className="paneLabel">채팅</p>
                  <div className="message user">CSV 정리법을 배우고 매주 리포트로 만들고 싶다.</div>
                  <div className="message system">학습 셀, 검증 셀, dry-run 태스크로 흐름을 분리했다.</div>
                </div>
                <div className="notebookPane">
                  <div className="cellHeader">
                    <span># %% Python</span>
                    <strong>preview</strong>
                  </div>
                  <pre>{`import pandas as pd
df = pd.read_csv("spend.csv")
report = df.groupby("week").sum()`}</pre>
                  <div className="runResult">실행 가능 / 검증 가능 / 태스크 승격 가능</div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </section>

      <section className="contentBand productBand">
        <div className="sectionIntro">
          <p className="eyebrow">Product surface</p>
          <h2>Codaro의 강점은 학습과 자동화가 갈라지지 않는 데 있다.</h2>
          <p>
            튜토리얼을 읽고 끝내는 도구가 아니라, 배운 코드를 로컬에서 실행하고 반복 업무로 승격시키는
            작업 표면이다. 공개 사이트는 이 제품 흐름을 문서와 글까지 같은 톤으로 보여준다.
          </p>
        </div>
        <div className="proofGrid">
          {proofItems.map((item) => (
            <article className="proofCard" key={item.title}>
              <span>{item.title}</span>
              <p>{item.copy}</p>
            </article>
          ))}
        </div>
        <div className="surfaceGrid">
          {surfaces.map((surface) => {
            const Icon = surface.icon;
            return (
              <article className="surfaceCard" key={surface.label}>
                <Icon size={22} aria-hidden="true" />
                <p>{surface.label}</p>
                <h3>{surface.title}</h3>
                <span>{surface.copy}</span>
              </article>
            );
          })}
        </div>
      </section>

      <section className="splitSection releaseSection">
        <div>
          <p className="eyebrow">Release trust</p>
          <h2>실행물은 릴리즈에서, 설명은 문서에서, 변경 기록은 Codaro 소식에서 확인한다.</h2>
          <p>
            사용자는 공개 문서에서 제품 방향을 확인하고, 릴리즈에서 launcher와 checksum,
            manifest, runtime, backend wheel 자산을 확인한 뒤 실행할 수 있다.
          </p>
          <div className="releaseLinks" aria-label="릴리즈 검증 링크">
            {releaseLinks.map((link) => (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ))}
          </div>
        </div>
        <div className="trustList">
          <TrustItem icon={ShieldCheck} title="로컬 우선" copy="기본 학습과 실행은 사용자의 로컬 런타임을 기준으로 한다." />
          <TrustItem icon={FileCheck2} title="검증 가능한 배포" copy="릴리즈 자산, checksum, manifest를 함께 확인한다." />
          <TrustItem icon={Library} title="문서 일원화" copy="문서, 블로그, 검색 색인은 같은 원천에서 나온다." />
        </div>
      </section>

      <section className="contentBand faqBand" aria-labelledby="home-faq-title">
        <div className="sectionIntro">
          <p className="eyebrow">FAQ</p>
          <h2 id="home-faq-title">자주 묻는 질문</h2>
          <p>
            Jupyter·marimo와의 차이, AI 사용 여부, 라이선스, 프라이버시까지 — 처음 Codaro를 접할 때
            가장 많이 나오는 8개 질문을 한 곳에 정리했다.
          </p>
        </div>
        <div className="faqList">
          {faqEntries.map((entry, index) => (
            <details key={entry.question} className="faqItem" open={index === 0}>
              <summary>{entry.question}</summary>
              <p>{entry.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}

function TrustItem({ icon: Icon, title, copy }) {
  return (
    <article className="trustItem">
      <Icon size={21} aria-hidden="true" />
      <div>
        <h3>{title}</h3>
        <p>{copy}</p>
      </div>
    </article>
  );
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
