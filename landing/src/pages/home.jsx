import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Code2,
  Download,
  FileSpreadsheet,
  Globe2,
  Laptop,
  Play,
  ShieldCheck,
  Workflow,
} from "lucide-react";
import { Badge } from "@astryxdesign/core/Badge";
import { Button } from "@astryxdesign/core/Button";
import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";

import { ProductVisual } from "../components/productVisual.jsx";
import { brand } from "../lib/brand.js";
import { curriculumLessons, curriculumRuntimeCounts } from "../lib/generated/curriculum.js";

const appPath = (path = "/") => brand.appPath(path);

const proofSteps = [
  {
    icon: BookOpen,
    label: "이해",
    title: "완성 예제로 먼저 봅니다.",
    copy: "무엇을 만들지, 입력이 어떻게 결과로 바뀌는지부터 확인합니다.",
  },
  {
    icon: Code2,
    label: "수정",
    title: "코드를 직접 바꿉니다.",
    copy: "복사한 정답이 아니라 편집 가능한 셀에서 작은 변화를 만듭니다.",
  },
  {
    icon: Play,
    label: "실행",
    title: "브라우저에서 바로 실행합니다.",
    copy: "설치 없이 출력과 오류를 같은 자리에서 확인합니다.",
  },
  {
    icon: CheckCircle2,
    label: "검증",
    title: "강한 검증이 자동으로 이어집니다.",
    copy: "별도 확인 클릭 없이 결과, 피드백, 다음 학습이 갱신됩니다.",
  },
];

const outcomeStories = [
  {
    icon: FileSpreadsheet,
    eyebrow: "DATA REPORT",
    title: "흩어진 표를 읽히는 보고서로",
    copy: "정리, 비교, 시각화, 해석을 하나의 재현 가능한 Python 흐름으로 만듭니다.",
    assetId: "runLearningDetail",
    href: `${appPath("/learn")}?path=dataReporting`,
  },
  {
    icon: Workflow,
    eyebrow: "SAFE AUTOMATION",
    title: "반복 작업을 검증 가능한 자동화로",
    copy: "웹에서 로직을 익힌 뒤 Local에서 파일, 일정, 실제 업무 환경까지 연결합니다.",
    assetId: "localAutomationDesktop",
    href: `${appPath("/learn")}?path=fileAutomation`,
  },
];

function firstLessonHref() {
  const lesson = curriculumLessons.find((item) => item.runtimeTier === "browser") || curriculumLessons[0];
  if (!lesson) return appPath("/learn");
  const pathId = lesson.eligiblePathIds[0];
  const href = appPath(`${lesson.route.replace(/\/$/, "")}/`);
  return pathId ? `${href}?path=${encodeURIComponent(pathId)}` : href;
}

export function HomePage() {
  // Product contract tests intentionally follow this symbol. It now points at the first editable lesson.
  const curriculumUrl = firstLessonHref();

  return (
    <main className="homeAstryx homeV3">
      <section className="homeProductHero" aria-labelledby="home-title">
        <ProductVisual
          assetId="webRunDesktop"
          className="homeProductHeroImage homeProductHeroImageDesktop"
          eager
          width={1440}
        />
        <ProductVisual
          assetId="runLearningMobile"
          className="homeProductHeroImage homeProductHeroImageMobile"
          eager
          width={390}
        />
        <div className="homeShell homeProductHeroContent">
          <Badge variant="neutral" label="WEB LEARNING · LOCAL AUTOMATION" />
          <Heading id="home-title" level={1}>Codaro</Heading>
          <p className="homeProductStatement">
            Python을 읽는 데서 멈추지 않고,<br />
            직접 바꾸고 실행해 결과로 증명합니다.
          </p>
          <div className="homeHeroActions">
            <Button
              as="a"
              href={curriculumUrl}
              variant="primary"
              size="lg"
              label="웹에서 바로 학습"
              icon={<Play size={18} aria-hidden="true" />}
            />
            <Button
              as="a"
              href={appPath("/learn")}
              variant="secondary"
              size="lg"
              label="학습 경로 둘러보기"
              icon={<Globe2 size={18} aria-hidden="true" />}
            />
          </div>
          <a className="homeLocalLink" href={brand.launcherDownloadUrl}>
            <Download size={16} aria-hidden="true" />
            Windows Local 받기
            <ArrowRight size={15} aria-hidden="true" />
          </a>
        </div>
        <div className="homeHeroWorkbench" aria-label="브라우저 Python 실행 예시">
          <div className="homeHeroWorkbenchBar">
            <span><Code2 size={15} aria-hidden="true" /> 첫 Python 프로그램</span>
            <span><Globe2 size={14} aria-hidden="true" /> Web 준비됨</span>
          </div>
          <div className="homeHeroCode">
            <span aria-hidden="true">1</span>
            <code><b>name</b> = <em>&quot;Codaro&quot;</em></code>
            <span aria-hidden="true">2</span>
            <code><b>print</b>(f<em>&quot;Hello, {"{name}"}&quot;</em>)</code>
          </div>
          <div className="homeHeroOutput">
            <span>실행 결과</span>
            <code>Hello, Codaro</code>
          </div>
          <div className="homeHeroCheck">
            <CheckCircle2 size={17} aria-hidden="true" />
            <span><strong>검증 통과</strong> 출력 값과 문자열 형식이 모두 맞습니다.</span>
          </div>
        </div>
      </section>

      <section className="homeProofLoop" aria-labelledby="proof-loop-title">
        <div className="homeShell">
          <header className="homeSectionHeading homeSectionHeadingCompact">
            <span className="homeKicker">LEARN BY PROOF</span>
            <Heading id="proof-loop-title" level={2}>한 화면에서 이해하고, 바꾸고, 검증합니다.</Heading>
            <Text color="secondary">
              확인 버튼으로 학습을 끊지 않습니다. 실행하면 필요한 결과와 다음 단계가 같은 흐름에 나타납니다.
            </Text>
          </header>
          <ol className="homeProofSteps">
            {proofSteps.map((step, index) => (
              <li key={step.label}>
                <span className="homeProofIndex">{String(index + 1).padStart(2, "0")}</span>
                <step.icon size={20} aria-hidden="true" />
                <small>{step.label}</small>
                <strong>{step.title}</strong>
                <p>{step.copy}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="homeOutcomeBand" aria-labelledby="outcome-title">
        <div className="homeShell">
          <header className="homeSectionHeading">
            <span className="homeKicker">CHOOSE AN OUTCOME</span>
            <Heading id="outcome-title" level={2}>문법 목록보다 만들 결과에서 시작하세요.</Heading>
            <Text color="secondary">
              경로마다 필요한 선행 개념, Web에서 끝낼 범위, Local로 확장할 지점을 처음부터 정직하게 보여줍니다.
            </Text>
          </header>
          <div className="homeOutcomeStories">
            {outcomeStories.map((story) => (
              <a href={story.href} className="homeOutcomeStory" key={story.eyebrow}>
                <ProductVisual assetId={story.assetId} className="homeOutcomeImage" width={720} />
                <span className="homeOutcomeCopy">
                  <span><story.icon size={17} aria-hidden="true" /> {story.eyebrow}</span>
                  <strong>{story.title}</strong>
                  <small>{story.copy}</small>
                </span>
                <ArrowRight size={19} aria-hidden="true" />
              </a>
            ))}
          </div>
          <a className="homeInlineAction" href={appPath("/learn")}>
            여섯 개 목표 경로 모두 보기 <ArrowRight size={16} aria-hidden="true" />
          </a>
        </div>
      </section>

      <section className="homeRuntimeBand" aria-labelledby="runtime-title">
        <div className="homeShell homeRuntimeLayout">
          <div className="homeRuntimeCopy">
            <span className="homeKicker">ONE PRODUCT, TWO RUNTIMES</span>
            <Heading id="runtime-title" level={2}>Web은 완전한 학습실, Local은 더 강한 작업실입니다.</Heading>
            <Text color="secondary">
              {curriculumRuntimeCounts.browser}개 레슨은 브라우저에서 실행, 강검증, 진도 저장까지 끝냅니다.
              운영체제 권한이 필요한 {curriculumRuntimeCounts.local}개 레슨은 Local 필요를 미리 표시합니다.
            </Text>
            <div className="homeRuntimeActions">
              <Button
                as="a"
                href={curriculumUrl}
                variant="primary"
                label="첫 레슨 실행"
                icon={<Globe2 size={17} aria-hidden="true" />}
              />
              <a href={brand.launcherDownloadUrl}>
                <Download size={16} aria-hidden="true" /> Local 다운로드
              </a>
            </div>
          </div>
          <div className="homeRuntimeProof">
            <ProductVisual assetId="localNotebookDesktop" className="homeRuntimeImage" width={900} />
            <div>
              <Globe2 size={20} aria-hidden="true" />
              <span>Web</span>
              <strong>설치 없는 Python 실행</strong>
              <small>코드 · 출력 · 강검증 · 진도</small>
            </div>
            <div>
              <Laptop size={20} aria-hidden="true" />
              <span>Local</span>
              <strong>내 환경의 실제 자동화</strong>
              <small>파일 · 터미널 · 패키지 · 일정</small>
            </div>
          </div>
        </div>
      </section>

      <section className="homeTrustBand" aria-labelledby="trust-title">
        <div className="homeShell homeTrustLayout">
          <ShieldCheck size={24} aria-hidden="true" />
          <div>
            <Heading id="trust-title" level={2}>내 코드와 결과는 내 통제 안에 있습니다.</Heading>
            <Text color="secondary">
              Local 릴리즈는 체크섬, manifest, SBOM을 함께 제공하고 학습한 Python은 일반 파일로 그대로 남습니다.
            </Text>
          </div>
          <a href={brand.releaseUrl}>릴리즈 검증하기 <ArrowRight size={16} aria-hidden="true" /></a>
        </div>
      </section>
    </main>
  );
}
