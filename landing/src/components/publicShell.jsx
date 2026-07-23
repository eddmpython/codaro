import { ChevronDown, Menu, Monitor, Moon, Search, Sun, X } from "lucide-react";
import { useState } from "react";
import { brand } from "../lib/brand.js";
import { appPath } from "../lib/publicRouting.js";

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

const primaryNavigation = [
  { href: "/learn", label: "학습", match: "/learn" },
  { href: brand.appPath("/run/?surface=editor#editor"), label: "노트북", external: true },
  { href: brand.appPath("/run/?surface=automation#automation"), label: "자동화", external: true },
];

export function Header({ currentPath, onNavigate, themeMode, resolvedTheme, onToggleTheme }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const themeLabel = themeMode === "system" ? "시스템 테마" : themeMode === "dark" ? "다크 테마" : "라이트 테마";
  const navigate = (event, path) => {
    setMenuOpen(false);
    onNavigate(event, appPath(path));
  };
  return (
    <header className="publicHeader" data-public-shell="astryx">
      <a className="publicSkipLink" href="#public-main">본문으로 건너뛰기</a>
      <div className="publicHeaderInner">
      <a
        className="publicBrand"
        href={appPath("/")}
        onClick={(event) => navigate(event, "/")}
        aria-label="Codaro 홈"
      >
        <img src={brand.avatarSmallUrl} alt="" width="30" height="30" />
        <span>Codaro</span>
      </a>
      <nav className="publicPrimaryNav" aria-label="주요 탐색">
        {primaryNavigation.map((item) => (
          <a
            aria-current={item.match && isActivePath(currentPath, item.match) ? "page" : undefined}
            href={item.external ? item.href : appPath(item.href)}
            key={item.href}
            onClick={item.external ? undefined : (event) => navigate(event, item.href)}
          >
            {item.label}
          </a>
        ))}
      </nav>
      <div className="publicCommands">
        <a className="publicRunCommand" href={brand.appPath("/run/?surface=editor#editor")}>새 노트북</a>
        <a
          className="publicIconCommand"
          href={appPath("/search")}
          aria-label="검색"
          title="검색"
          onClick={(event) => navigate(event, "/search")}
        >
          <Search size={18} aria-hidden="true" />
        </a>
        <details className="publicResourceMenu">
          <summary>리소스 <ChevronDown size={14} aria-hidden="true" /></summary>
          <div>
            <a href={appPath("/docs")} onClick={(event) => navigate(event, "/docs")}>문서</a>
            <a href={appPath("/docs/blog")} onClick={(event) => navigate(event, "/docs/blog")}>소식</a>
            <a href={appPath("/packs")} onClick={(event) => navigate(event, "/packs")}>팩</a>
            <a href={appPath("/tools")} onClick={(event) => navigate(event, "/tools")}>도구</a>
          </div>
        </details>
        <button
          className="publicIconCommand"
          type="button"
          onClick={onToggleTheme}
          title={`${themeLabel} - 테마 전환`}
          aria-label={`${themeLabel}. 다음 테마로 전환`}
        >
          {themeMode === "system" ? (
            <Monitor size={17} aria-hidden="true" />
          ) : resolvedTheme === "dark" ? (
            <Sun size={17} aria-hidden="true" />
          ) : (
            <Moon size={17} aria-hidden="true" />
          )}
        </button>
        <button
          className="publicIconCommand publicMenuToggle"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="public-mobile-menu"
          aria-label={menuOpen ? "메뉴 닫기" : "메뉴 열기"}
          title={menuOpen ? "메뉴 닫기" : "메뉴 열기"}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
        </button>
      </div>
      </div>
      {menuOpen ? (
        <nav className="publicMobileMenu" id="public-mobile-menu" aria-label="모바일 탐색">
          <a className="publicMobileStart" href={appPath("/learn")} onClick={(event) => navigate(event, "/learn")}>웹에서 시작</a>
          {primaryNavigation.map((item) => (
            <a
              aria-current={item.match && isActivePath(currentPath, item.match) ? "page" : undefined}
              href={item.external ? item.href : appPath(item.href)}
              key={item.href}
              onClick={item.external ? undefined : (event) => navigate(event, item.href)}
            >
              {item.label}
            </a>
          ))}
          <a href={appPath("/search")} onClick={(event) => navigate(event, "/search")}>검색</a>
          <a href={appPath("/docs")} onClick={(event) => navigate(event, "/docs")}>문서</a>
          <a href={appPath("/docs/blog")} onClick={(event) => navigate(event, "/docs/blog")}>소식</a>
          <a href={appPath("/packs")} onClick={(event) => navigate(event, "/packs")}>팩</a>
          <a href={appPath("/tools")} onClick={(event) => navigate(event, "/tools")}>도구</a>
        </nav>
      ) : null}
    </header>
  );
}

function isActivePath(currentPath, match) {
  if (match === "/docs" && currentPath.startsWith("/docs/blog")) return false;
  return currentPath === match || currentPath.startsWith(`${match}/`);
}

export function Footer() {
  return (
    <footer className="siteFooter">
      <div className="footerGrid">
        <div className="footerBrand">
          <a className="brandMark" href={appPath("/")}>
            <img src={brand.avatarSmallUrl} alt="" width="32" height="32" />
            <span>Codaro</span>
          </a>
          <p>브라우저에서 배우고 검증한 Python을 파일, 일정, 반복 업무를 다루는 Local 자동화로 확장합니다.</p>
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
            <li><a href={appPath("/learn")}>웹 학습</a></li>
            <li><a href={brand.appPath("/run/")}>Run</a></li>
            <li><a href={brand.launcherDownloadUrl}>Local 다운로드</a></li>
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
        <span>Web 학습 · Local 자동화</span>
      </div>
    </footer>
  );
}
