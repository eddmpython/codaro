// home.jsx - 랜딩 홈. App.jsx와 prerenderReact.js가 공유하는 단일 SSOT(React SSR).
// astryx 디자인 시스템으로 재설계. 레이아웃 스캐폴딩은 styles/homeAstryx.css.
import {
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Download,
  Globe,
  ShieldCheck,
  Terminal,
  Workflow,
  Zap,
} from "lucide-react";
import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";
import { Button } from "@astryxdesign/core/Button";
import { Badge } from "@astryxdesign/core/Badge";
import { Card } from "@astryxdesign/core/Card";
import { Divider } from "@astryxdesign/core/Divider";
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

const flowSteps = [
  { icon: BookOpen, num: "01 배운다", title: "커리큘럼 셀", copy: "예측 → 실행 → 오류 → 검증 흐름을 한 학습 카드 안에서." },
  { icon: Terminal, num: "02 실행한다", title: "로컬 런타임", copy: "percent format .py를 내 PC에서 그대로 실행하고 결과를 확인." },
  { icon: Workflow, num: "03 승격한다", title: "dry-run 태스크", copy: "검증된 셀을 반복 가능한 개인 자동화로 키운다." },
];

const tierRows = [
  { surface: "커리큘럼 학습", web: "브라우저에서 완전", local: "완전", note: "콘텐츠 + 브라우저 Python 실행" },
  { surface: "채팅 · 에디터 · 노트북", web: "브라우저에서 실행", local: "완전", note: "대규모 numpy만 로컬 몫" },
  { surface: "터미널(PTY)", web: "서버리스 셸로 대체", local: "완전", note: "진짜 PTY는 로컬" },
  { surface: "자동화(상주 스케줄)", web: "로컬 전용", local: "완전", note: "탭이 닫히면 못 돌아 로컬/Actions 티어" },
];

const releaseLinks = [
  { href: brand.launcherChecksumUrl, label: "체크섬" },
  { href: brand.releaseManifestUrl, label: "manifest" },
  { href: brand.pythonRuntimeUrl, label: "Python runtime" },
  { href: brand.launcherSbomUrl, label: "SBOM" },
  { href: brand.releaseUrl, label: "GitHub Releases" },
];

export function HomePage() {
  return (
    <main className="homeAstryx">
      <section className="homeWrap homeHero">
        <Badge variant="neutral" label="LOCAL-FIRST · PYTHON STUDIO" />
        <div className="homeHeroHeadline">
          <Heading level={1} type="display-1">
            배운 코드가 그대로 실행되고, 실행이 곧 자동화가 된다.
          </Heading>
        </div>
        <div className="homeHeroLead">
          <Text type="body-lg" color="muted">
            채팅·에디터·커리큘럼·자동화를 하나의 로컬 Python 작업대에서 잇습니다.
          </Text>
        </div>
        <div className="homeHeroActions">
          <Button
            as="a"
            href={brand.launcherDownloadUrl}
            variant="primary"
            size="lg"
            label="Codaro.exe 다운로드"
            icon={<Download size={17} aria-hidden="true" />}
          />
          <Button
            as="a"
            href={brand.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            variant="secondary"
            size="lg"
            label="GitHub에서 보기"
            endContent={<ArrowRight size={16} aria-hidden="true" />}
          />
        </div>
        <Text type="body-sm" color="subtle">
          Windows x64 · 런타임 포함 · 오프라인 실행 · 무료
        </Text>
      </section>

      <section className="homeWrap homeSection">
        <Card padding={6} variant="muted">
          <div className="homeSectionHead" style={{ marginBottom: 18 }}>
            <Badge variant="accent" label="CODARO ANYWHERE" icon={<Globe size={13} aria-hidden="true" />} />
            <Heading level={2} type="display-3">
              설치 없이, 브라우저에서 바로 배운다.
            </Heading>
            <Text type="body" color="muted">
              브라우저 탭에서 진짜 Python이 돕니다. 프로세스·병렬·상태 복원까지 되는 런타임 위에서, 서버도
              설치도 없이 배우고 실행하고, 로컬로 완전하게 이어집니다.
            </Text>
          </div>
          <div className="homeHeroActions" style={{ justifyContent: "flex-start" }}>
            <Button
              as="a"
              href={appPath("/docs")}
              variant="primary"
              label="커리큘럼 둘러보기"
              icon={<BookOpen size={16} aria-hidden="true" />}
            />
            <Button
              as="a"
              href={brand.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              variant="ghost"
              label="어떻게 되나 보기"
              endContent={<ArrowRight size={15} aria-hidden="true" />}
            />
          </div>
        </Card>
      </section>

      <section className="homeWrap homeSection">
        <div className="homeSectionHead">
          <Text type="label" color="accent">네 개의 표면, 하나의 문서 모델</Text>
          <Heading level={2} type="display-3">학습과 자동화가 갈라지지 않는다.</Heading>
          <Text type="body" color="muted">
            채팅, 에디터, 커리큘럼, 자동화가 같은 셀 흐름을 공유합니다. 맥락이 끊기지 않습니다.
          </Text>
        </div>
        <div className="homeGrid2">
          {surfaces.map((s) => (
            <Card key={s.label} padding={5}>
              <div className="homeCardStack">
                <Badge variant="neutral" label={s.label} />
                <Heading level={3} type="title">{s.title}</Heading>
                <Text type="body-sm" color="muted">{s.copy}</Text>
                <div className="homeMini">{s.mini}</div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="homeWrap homeSection">
        <div className="homeSectionHead">
          <Text type="label" color="accent">작동 방식</Text>
          <Heading level={2} type="display-3">배운 코드가 자동화가 되기까지.</Heading>
        </div>
        <div className="homeGrid3">
          {flowSteps.map((f) => (
            <Card key={f.num} padding={5}>
              <div className="homeCardStack">
                <f.icon size={22} aria-hidden="true" />
                <Text type="label" color="subtle">{f.num}</Text>
                <Heading level={3} type="title">{f.title}</Heading>
                <Text type="body-sm" color="muted">{f.copy}</Text>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="homeWrap homeSection">
        <div className="homeSectionHead">
          <Text type="label" color="accent">정직한 등급</Text>
          <Heading level={2} type="display-3">무엇이 웹에서 되고, 무엇이 로컬 몫인가.</Heading>
          <Text type="body" color="muted">
            브라우저에서 되는 표면은 웹으로 완전히, 안 되는 것은 로컬 티어로 이어집니다. 과장하지 않습니다.
          </Text>
        </div>
        <Card padding={2}>
          <table className="homeTierTable">
            <thead>
              <tr>
                <th>표면</th>
                <th>웹</th>
                <th>로컬</th>
                <th>메모</th>
              </tr>
            </thead>
            <tbody>
              {tierRows.map((r) => (
                <tr key={r.surface}>
                  <td>{r.surface}</td>
                  <td>{r.web}</td>
                  <td>{r.local}</td>
                  <td style={{ opacity: 0.7 }}>{r.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </section>

      <section className="homeWrap homeSection">
        <div className="homeGrid2">
          <div className="homeCardStack">
            <Text type="label" color="accent">검증</Text>
            <Heading level={2} type="display-3">다운로드 전에 직접 검증할 수 있다.</Heading>
            <Text type="body" color="muted">
              학습과 실행의 기준은 브라우저 샌드박스가 아니라 당신의 로컬 Python 환경입니다.
              릴리즈의 체크섬·manifest·SBOM으로 받기 전에 확인하세요.
            </Text>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 6 }}>
              <Text type="body-sm"><ShieldCheck size={14} style={{ verticalAlign: "-2px", marginRight: 8 }} aria-hidden="true" />로컬 우선 · 코드와 산출물은 내 PC에</Text>
              <Text type="body-sm"><Check size={14} style={{ verticalAlign: "-2px", marginRight: 8 }} aria-hidden="true" />체크섬 · manifest · SBOM 공개</Text>
              <Text type="body-sm"><Zap size={14} style={{ verticalAlign: "-2px", marginRight: 8 }} aria-hidden="true" />AI는 선택적 · 학습·실행·자동화는 AI 없이도 완전 동작</Text>
            </div>
          </div>
          <Card padding={5}>
            <div className="homeCardStack">
              <Text type="label" color="subtle"><CheckCircle2 size={13} style={{ verticalAlign: "-2px", marginRight: 6 }} aria-hidden="true" />GitHub Releases / latest</Text>
              <div className="homeMini" style={{ opacity: 0.85 }}>
                {"Codaro.exe            # 단일 실행 파일\nCodaro.exe.sha256     # SHA256 체크섬\ncodaro.spdx.json      # SBOM\nrelease-manifest.json # 버전 핀\npython-runtime.zip    # 관리형 런타임"}
              </div>
              <Divider />
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {releaseLinks.map((l) => (
                  <Button key={l.href} as="a" href={l.href} variant="secondary" size="sm" label={l.label} />
                ))}
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section className="homeWrap homeSection">
        <div className="homeSectionHead">
          <Text type="label" color="accent">FAQ</Text>
          <Heading level={2} type="display-3">자주 묻는 질문</Heading>
        </div>
        <div>
          {faqEntries.map((entry, index) => (
            <details key={entry.question} className="homeFaqItem" open={index === 0}>
              <summary>{entry.question}</summary>
              <div style={{ marginTop: 8 }}>
                <Text type="body-sm" color="muted">{entry.answer}</Text>
              </div>
            </details>
          ))}
        </div>
      </section>

      <section className="homeWrap homeFinalCta">
        <Heading level={2} type="display-2">지금, 배운 코드를 자동화로 바꿔보세요.</Heading>
        <div className="homeHeroActions">
          <Button
            as="a"
            href={brand.launcherDownloadUrl}
            variant="primary"
            size="lg"
            label="Codaro.exe 다운로드"
            icon={<Download size={17} aria-hidden="true" />}
          />
          <Button
            as="a"
            href={brand.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            variant="secondary"
            size="lg"
            label="GitHub에서 보기"
            endContent={<ArrowRight size={16} aria-hidden="true" />}
          />
        </div>
      </section>
    </main>
  );
}
