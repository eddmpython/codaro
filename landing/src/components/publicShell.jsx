import { ChevronDown, Menu, Monitor, Moon, Search, Sun, X } from "lucide-react";
import { useState } from "react";
import { brand } from "../lib/brand.js";
import { appPath } from "../lib/publicRouting.js";
import { SocialLinks } from "../styles/generated/socialLinks.tsx";

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
        <SocialLinks className="publicSocialLinks" label="Codaro SNS" />
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
          <SocialLinks className="footerSocialLinks" />
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
