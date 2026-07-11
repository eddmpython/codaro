// home.jsx - 랜딩 홈 페이지. App.jsx와 prerenderReact.js가 공유하는 단일 SSOT.
// (기존 App.jsx의 HomePage를 분리한 것. prerender가 이 컴포넌트를 React SSR로 렌더한다.)
import { useEffect, useRef } from "react";
import {
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Download,
  FileCheck2,
  Library,
  Play,
  Settings2,
  ShieldCheck,
  Star,
  Terminal,
  Workflow,
} from "lucide-react";
import { brand } from "../lib/brand.js";
import { faqEntries } from "../lib/faq.js";

const appPath = (path = "/") => brand.appPath(path);

const surfaces = [
  {
    label: "채팅",
    title: "요청을 작업으로 정리",
    copy: "학습 목표와 반복 업무를 셀, 검증, 자동화 후보로 나눠 시작한다.",
    mini: "> 매주 지출 CSV를 리포트로\n→ 학습셀 · 검증셀 · 태스크 분리",
  },
  {
    label: "에디터",
    title: "로컬에서 바로 실행",
    copy: "Python과 Markdown 셀을 일반 파일처럼 유지하고 실행 결과를 옆에서 확인한다.",
    mini: "# %% Python\ndf.groupby(\"week\").sum()",
  },
  {
    label: "커리큘럼",
    title: "학습을 실행 단위로 저장",
    copy: "설명, 예측, 실행, 검증이 같은 학습 카드 안에서 끊기지 않는다.",
    mini: "lesson: pandas-groupby\n예측 → 실행 → 검증 → 변주",
  },
  {
    label: "자동화",
    title: "검증된 흐름을 태스크로 승격",
    copy: "반복 가능한 셀과 스크립트를 dry-run 계획, 태스크, 리포트로 키운다.",
    mini: "@every_5m\ntask: weekly_report → ok",
  },
];

const releaseLinks = [
  { href: brand.launcherChecksumUrl, label: "체크섬" },
  { href: brand.releaseManifestUrl, label: "manifest" },
  { href: brand.pythonRuntimeUrl, label: "Python runtime" },
  { href: brand.pythonRuntimeChecksumUrl, label: "runtime checksum" },
  { href: brand.launcherSbomUrl, label: "SBOM" },
  { href: brand.releaseUrl, label: "GitHub Releases" },
];

function useRevealObserver() {
  const ref = useRef(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return undefined;
    const raf = requestAnimationFrame(() => root.classList.add("is-loaded"));
    const targets = root.querySelectorAll(".observe");
    if (!("IntersectionObserver" in window) || targets.length === 0) {
      targets.forEach((el) => el.classList.add("in-view"));
      return () => cancelAnimationFrame(raf);
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -40px 0px" },
    );
    targets.forEach((el) => io.observe(el));
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, []);
  return ref;
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

export function HomePage() {
  const rootRef = useRevealObserver();
  return (
    <main className="homePage" ref={rootRef}>
      <section className="heroSection" aria-labelledby="home-title">
        <p className="eyebrow reveal" style={{ "--d": "0ms" }}>
          LOCAL-FIRST · PYTHON STUDIO
        </p>
        <h1 id="home-title" className="reveal" style={{ "--d": "80ms" }}>
          배운 코드가 그대로 실행되고, 실행이 곧 자동화가 된다.
        </h1>
        <p className="heroLead reveal" style={{ "--d": "180ms" }}>
          채팅·에디터·커리큘럼·자동화를 하나의 로컬 <span className="latin">Python</span> 작업대에서 잇습니다.
        </p>
        <div className="heroActions reveal" style={{ "--d": "260ms" }}>
          <a className="primaryButton" href={brand.launcherDownloadUrl}>
            <Download size={17} aria-hidden="true" />
            Codaro.exe 다운로드
          </a>
          <a className="secondaryButton" href={brand.repoUrl} rel="noopener noreferrer" target="_blank">
            GitHub에서 보기
            <ArrowRight size={16} aria-hidden="true" />
          </a>
        </div>
        <p className="heroReassure reveal" style={{ "--d": "340ms" }}>
          Windows x64 · 런타임 포함 · 오프라인 실행 · 무료
        </p>
        <div className="heroFrameWrap reveal" style={{ "--d": "440ms" }}>
          <img
            className="heroMascot"
            src={brand.avatarHeroUrl}
            alt="Codaro 마스코트"
            width="236"
            height="236"
          />
          <div className="productFrame" aria-label="Codaro 로컬 실행 미리보기">
            <div className="frameChrome">
              <span className="dots" aria-hidden="true">
                <span></span>
                <span></span>
                <span></span>
              </span>
              <span>codaro.local — spend_report.py</span>
              <span className="runBtn">
                <Play size={12} aria-hidden="true" />
                검증 실행
              </span>
            </div>
            <div className="frameBody workField">
              <div className="codeLine">
                <span className="tok-c"># %% Python</span>
              </div>
              <div className="codeLine">import pandas as pd</div>
              <div className="codeLine">
                df = pd.<span className="tok-fn">read_csv</span>(<span className="tok-s">"spend.csv"</span>)
              </div>
              <div className="codeLine">
                report = df.<span className="tok-fn">groupby</span>(<span className="tok-s">"week"</span>).<span className="tok-fn">sum</span>()
              </div>
              <div className="runRow">
                <span>▸ 실행</span>
                <span className="runBar" aria-hidden="true"></span>
              </div>
              <div className="outputLine">
                <span className="tok-c"># week&nbsp;&nbsp;&nbsp;spend</span>
                {"\n"}2025-W21&nbsp;&nbsp;&nbsp;412,900
              </div>
            </div>
            <span className="verifiedPill">
              <Check size={13} aria-hidden="true" />
              검증 완료
            </span>
          </div>
        </div>
      </section>

      <section className="trustBand observe" aria-label="Codaro 신뢰 신호">
        <div className="trustStrip">
          <span>
            <Star size={14} aria-hidden="true" />
            GitHub 공개 저장소
          </span>
          <span>
            <ShieldCheck size={14} aria-hidden="true" />
            SHA256 · SBOM 검증 배포
          </span>
          <span>
            <Download size={14} aria-hidden="true" />
            Windows x64 단일 실행 파일
          </span>
          <span>
            <BookOpen size={14} aria-hidden="true" />
            463개 공개 커리큘럼 레슨
          </span>
        </div>
      </section>

      <section className="contentBand productBand observe">
        <div className="sectionIntro">
          <p className="eyebrow">// 네 개의 표면, 하나의 문서 모델</p>
          <h2>학습과 자동화가 갈라지지 않는다.</h2>
          <p>채팅, 에디터, 커리큘럼, 자동화가 같은 셀 흐름을 공유합니다. 맥락이 끊기지 않습니다.</p>
        </div>
        <div className="surfaceGrid">
          {surfaces.map((surface) => (
            <article className="surfaceCard" key={surface.label}>
              <p className="surfaceLabel">{surface.label}</p>
              <h3>{surface.title}</h3>
              <span>{surface.copy}</span>
              <div className="surfaceMini">{surface.mini}</div>
            </article>
          ))}
        </div>
      </section>

      <section className="contentBand seeItWork observe" aria-labelledby="home-see-title">
        <div className="sectionIntro">
          <p className="eyebrow">// 직접 보기</p>
          <h2 id="home-see-title">한 화면에서 배우고 · 실행하고 · 승격한다.</h2>
          <p>학습 셀을 실행 가능한 리포트 자동화로 전환하는 실제 작업 흐름.</p>
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
                <img src={brand.avatarSmallUrl} alt="" width="34" height="34" />
                <div>
                  <strong>Codaro</strong>
                  <span>local studio</span>
                </div>
              </div>
              <a href={appPath("/")}>
                <BookOpen size={16} aria-hidden="true" />
                채팅
              </a>
              <a className="active" href={appPath("/")}>
                <Terminal size={16} aria-hidden="true" />
                에디터
              </a>
              <a href={appPath("/")}>
                <CheckCircle2 size={16} aria-hidden="true" />
                커리큘럼
              </a>
              <a href={appPath("/")}>
                <Workflow size={16} aria-hidden="true" />
                자동화
              </a>
            </aside>
            <section className="editorCanvas">
              <div className="editorTopbar">
                <div>
                  <p>오늘의 작업</p>
                  <strong>CSV 정리를 주간 리포트 자동화로</strong>
                </div>
                <button type="button">
                  <Play size={15} aria-hidden="true" />
                  검증 실행
                </button>
              </div>
              <div className="workspaceGrid">
                <div className="chatPane">
                  <p className="paneLabel">채팅</p>
                  <div className="message user">매주 지출 CSV를 리포트로 만들고 싶어요.</div>
                  <div className="message system">학습 셀, 검증 셀, dry-run 태스크로 흐름을 분리했어요.</div>
                </div>
                <div className="notebookPane">
                  <div className="cellHeader">
                    <span># %% Python</span>
                    <strong>preview</strong>
                  </div>
                  <pre>{`import pandas as pd
df = pd.read_csv("spend.csv")
report = df.groupby("week").sum()`}</pre>
                  <div className="runResult">실행 성공 · 검증 가능 · 태스크 승격 가능</div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </section>

      <section className="contentBand flowSection observe" aria-labelledby="home-flow-title">
        <div className="sectionIntro">
          <p className="eyebrow">// 작동 방식</p>
          <h2 id="home-flow-title">배운 코드가 자동화가 되기까지.</h2>
        </div>
        <div className="flowGrid">
          <article className="flowStep">
            <p className="flowNum">01 배운다</p>
            <h3>커리큘럼 셀</h3>
            <p>예측 → 실행 → 오류 → 검증 흐름을 한 학습 카드 안에서.</p>
          </article>
          <article className="flowStep">
            <p className="flowNum">02 실행한다</p>
            <h3>로컬 런타임</h3>
            <p>percent format <span className="latin">.py</span>를 내 PC에서 그대로 실행하고 결과를 확인.</p>
          </article>
          <article className="flowStep">
            <p className="flowNum">03 승격한다</p>
            <h3>dry-run 태스크</h3>
            <p>검증된 셀을 반복 가능한 개인 자동화로 키운다.</p>
            <img className="flowMascot" src={brand.avatarFaceUrl} alt="" />
          </article>
        </div>
      </section>

      <section className="splitSection releaseSection observe">
        <div>
          <p className="eyebrow">// 검증</p>
          <h2>다운로드 전에 직접 검증할 수 있다.</h2>
          <p>
            학습과 실행의 기준은 브라우저 샌드박스가 아니라 당신의 로컬 Python 환경입니다.
            릴리즈의 체크섬·manifest·SBOM으로 받기 전에 확인하세요.
          </p>
          <div className="trustList">
            <TrustItem icon={ShieldCheck} title="로컬 우선" copy="코드·노트북·산출물은 모두 내 PC에 남는다." />
            <TrustItem icon={FileCheck2} title="검증 가능한 배포" copy="launcher 체크섬·manifest·SBOM을 함께 공개한다." />
            <TrustItem icon={Library} title="AI는 선택적" copy="학습·실행·자동화는 AI 없이도 완전 동작한다." />
          </div>
        </div>
        <div>
          <div className="checksumPanel" aria-label="릴리즈 자산">
            <div className="head">
              <span className="dot" aria-hidden="true"></span>
              GitHub Releases / latest
            </div>
            <p className="sha">
              Codaro.exe{"          "}<span className="tok-c"># 단일 실행 파일</span>
              {"\n"}Codaro.exe.sha256{"   "}<span className="tok-c"># SHA256 체크섬</span>
              {"\n"}codaro.spdx.json{"    "}<span className="tok-c"># SBOM</span>
              {"\n"}release-manifest.json <span className="tok-c"># 버전 핀</span>
              {"\n"}python-runtime…zip{"  "}<span className="tok-c"># 관리형 런타임</span>
            </p>
            <div className="checksumChips" aria-label="릴리즈 검증 링크">
              {releaseLinks.map((link) => (
                <a key={link.href} href={link.href}>
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="contentBand observe">
        <div className="brandMoment">
          <div className="brandField workField" aria-hidden="true"></div>
          <div className="brandMomentArt">
            <img src={brand.avatarHeroUrl} alt="Codaro 마스코트" />
          </div>
          <div className="brandMomentBody">
            <h2>코드를 배우는 일이 외롭지 않도록.</h2>
            <p>
              Codaro는 혼자 공부하는 사람이 끝까지 가도록 돕는 로컬 작업대입니다.
              배운 코드가 멈추지 않고 내 일을 대신할 때까지.
            </p>
            <a href={brand.repoUrl} rel="noopener noreferrer" target="_blank">
              GitHub에서 보기
              <ArrowRight size={14} aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      <section className="contentBand faqBand observe" aria-labelledby="home-faq-title">
        <div className="sectionIntro">
          <p className="eyebrow">// FAQ</p>
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

      <section className="contentBand finalCta observe" aria-label="지금 시작하기">
        <img src={brand.avatarFaceUrl} alt="" width="96" height="96" />
        <h2>지금, 배운 코드를 자동화로 바꿔보세요.</h2>
        <div className="heroActions">
          <a className="primaryButton" href={brand.launcherDownloadUrl}>
            <Download size={17} aria-hidden="true" />
            Codaro.exe 다운로드
          </a>
          <a className="secondaryButton" href={brand.repoUrl} rel="noopener noreferrer" target="_blank">
            GitHub에서 보기
            <ArrowRight size={16} aria-hidden="true" />
          </a>
        </div>
      </section>
    </main>
  );
}
