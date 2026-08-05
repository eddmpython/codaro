import { ChevronDown, Menu, Moon, Search, Sun, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { BrandMark } from "./brandMark.jsx";
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
  const [scrolled, setScrolled] = useState(false);
  const menuToggleRef = useRef(null);
  const themeLabel = resolvedTheme === "dark" ? "라이트 모드로" : "다크 모드로";
  const navigate = (event, path) => {
    setMenuOpen(false);
    onNavigate(event, appPath(path));
  };
  // 헤더는 투명하게 히어로 위에 떠 있다. 스크롤이 시작되면 본문이 헤더를 뚫고
  // 보이므로 그때부터 배경을 깔아 준다.
  useEffect(() => {
    const syncScrolled = () => setScrolled(window.scrollY > 8);
    syncScrolled();
    window.addEventListener("scroll", syncScrolled, { passive: true });
    return () => window.removeEventListener("scroll", syncScrolled);
  }, []);
  useEffect(() => {
    if (!menuOpen) return undefined;
    const closeWithEscape = (event) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setMenuOpen(false);
      menuToggleRef.current?.focus();
    };
    window.addEventListener("keydown", closeWithEscape);
    return () => window.removeEventListener("keydown", closeWithEscape);
  }, [menuOpen]);
  return (
    <header className="publicHeader" data-public-shell="astryx" data-scrolled={scrolled ? "true" : undefined}>
      <a className="publicSkipLink" href="#public-main">본문으로 건너뛰기</a>
      <div className="publicHeaderInner">
      <BrandMark
        className="publicBrand"
        href={appPath("/")}
        onClick={(event) => navigate(event, "/")}
      />
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
          title={themeLabel}
          aria-label={themeLabel}
        >
          {resolvedTheme === "dark" ? (
            <Sun size={17} aria-hidden="true" />
          ) : (
            <Moon size={17} aria-hidden="true" />
          )}
        </button>
        <SocialLinks className="publicSocialLinks" label="Codaro SNS" />
        <button
          className="publicIconCommand publicMenuToggle"
          ref={menuToggleRef}
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
          <BrandMark className="brandMark" href={appPath("/")} variant="footer" />
          <p>브라우저에서 배우고 검증한 Python을 파일, 일정, 반복 업무를 다루는 Local 자동화로 확장합니다.</p>
          <SocialLinks className="footerSocialLinks" />
        </div>
        <div className="footerCol">
          <h2>제품</h2>
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
          <h2>검증·신뢰</h2>
          <ul>
            <li><a href={brand.repoUrl} rel="noopener noreferrer" target="_blank">GitHub</a></li>
            <li><a href={brand.releaseUrl} rel="noopener noreferrer" target="_blank">Releases</a></li>
            <li><a href={brand.launcherChecksumUrl}>체크섬</a></li>
            <li><a href={brand.launcherSbomUrl}>SBOM</a></li>
          </ul>
        </div>
        <div className="footerCol">
          <h2>탐색</h2>
          <ul>
            <li><a href={appPath("/docs/blog")}>Codaro 소식</a></li>
            <li><a href={appPath("/search")}>검색</a></li>
            <li><a href="https://github.com/eddmpython/codaro/discussions" rel="noopener noreferrer" target="_blank">토론</a></li>
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
