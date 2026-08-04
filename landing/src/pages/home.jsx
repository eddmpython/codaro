import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Code2,
  Download,
  FileSpreadsheet,
  Globe2,
  Laptop,
  LineChart,
  Play,
  ShieldCheck,
  Workflow,
} from "lucide-react";
import { Badge } from "@astryxdesign/core/Badge";
import { Button } from "@astryxdesign/core/Button";
import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";

import { LiveCodeCell } from "../components/liveCodeCell.jsx";
import { ProductVisual } from "../components/productVisual.jsx";
import { brand } from "../lib/brand.js";
import { curriculumLessons, curriculumRuntimeCounts } from "../lib/generated/curriculum.js";

const appPath = (path = "/") => brand.appPath(path);

// 학습 한 사이클: 학습자가 하는 일. 제품 기능이 아니라 동사.
const proofSteps = [
  {
    icon: BookOpen,
    label: "읽는다",
    title: "완성된 코드로 먼저 본다.",
    copy: "무엇을 만들지, 입력이 결과로 어떻게 바뀌는지부터 한 화면에서 봅니다.",
  },
  {
    icon: Code2,
    label: "고친다",
    title: "셀에서 작은 변화를 만든다.",
    copy: "복사한 정답이 아니라 편집 가능한 코드에서 한 줄을 바꿔봅니다.",
  },
  {
    icon: Play,
    label: "실행한다",
    title: "브라우저에서 바로 돌린다.",
    copy: "설치 없이 출력과 오류를 같은 자리에서 확인합니다.",
  },
  {
    icon: CheckCircle2,
    label: "검증이 잡는다",
    title: "결과가 틀리면 그 자리에서 잡는다.",
    copy: "별도 확인 없이 결과, 피드백, 다음 단계가 같은 흐름에 갱신됩니다.",
  },
];

// 6개 목표 경로 - learn.jsx pathDefinitions와 같은 SSOT 자산 ID. 처음부터 끝까지 칼퇴까지 이어지는 축.
const outcomeStories = [
  {
    icon: Code2,
    eyebrow: "기초",
    title: "Python 기초 완주",
    copy: "값, 흐름, 함수를 직접 실행하며 작은 프로그램을 만듭니다.",
    assetId: "pythonFoundationOutcome",
    href: `${appPath("/learn")}?path=pythonFoundation`,
  },
  {
    icon: FileSpreadsheet,
    eyebrow: "데이터",
    title: "데이터 분석 보고서",
    copy: "흩어진 표를 정리·비교해 근거가 보이는 보고서로 만듭니다.",
    assetId: "dataReportOutcome",
    href: `${appPath("/learn")}?path=dataReporting`,
  },
  {
    icon: LineChart,
    eyebrow: "시각화",
    title: "데이터 시각화",
    copy: "차트 선택부터 해석·의사결정까지 하나의 흐름으로 이어갑니다.",
    assetId: "dataVisualizationOutcome",
    href: `${appPath("/learn")}?path=dataVisualization`,
  },
  {
    icon: Workflow,
    eyebrow: "자동화",
    title: "파일 자동화",
    copy: "반복 파일 작업을 코드로 잡고, Local에서 실제 파일까지 연결합니다.",
    assetId: "fileAutomationOutcome",
    href: `${appPath("/learn")}?path=fileAutomation`,
  },
  {
    icon: FileSpreadsheet,
    eyebrow: "자동화",
    title: "오피스 자동화",
    copy: "표와 문서를 매번 같은 품질로 만드는 다시 실행 가능한 흐름을 설계합니다.",
    assetId: "officeAutomationOutcome",
    href: `${appPath("/learn")}?path=officeAutomation`,
  },
  {
    icon: Globe2,
    eyebrow: "자동화",
    title: "웹 모니터링",
    copy: "요청, 점검, 알림, 복구를 안전한 감시 작업으로 운영합니다.",
    assetId: "webMonitoringOutcome",
    href: `${appPath("/learn")}?path=webMonitoring`,
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
  const curriculumUrl = firstLessonHref();

  return (
    <main className="homeAstryx homeV3">
      <section className="homeProductHero" aria-labelledby="home-title">
        <div className="homeShell homeHeroLayout">
          <div className="homeProductHeroContent">
            <Badge variant="neutral" label="브라우저에서 바로 실행하는 PYTHON" />
            <Heading id="home-title" level={1}>Codaro</Heading>
            <p className="homeProductStatement">
              어디서든 직접 치고,<br />
              반복은 자동화하고, 정시에 퇴근합니다.
            </p>
            <p className="homeProductDetail">
              브라우저만 있으면 설치 없이 Python을 바로 실행합니다. 결과를 보고 고치고, 익숙해지면 같은 코드로 반복 업무를 자동화해 Local 파일과 일정까지 연결합니다. 장소에 구애받지 않고, 배운 즉시 일하게 합니다.
            </p>
            <div className="homeHeroActions">
              <Button
                as="a"
                className="homeHeroPrimaryAction"
                href={curriculumUrl}
                variant="primary"
                size="lg"
                label="웹에서 첫 레슨 실행"
                icon={<Play size={18} aria-hidden="true" />}
              />
              <Button
                as="a"
                className="homeHeroSecondaryAction"
                href={appPath("/learn")}
                variant="secondary"
                size="lg"
                label="학습 경로 보기"
                icon={<Globe2 size={18} aria-hidden="true" />}
              />
            </div>
            <a className="homeLocalLink" href={brand.launcherDownloadUrl}>
              <Download size={16} aria-hidden="true" />
              Windows Local 받기
              <ArrowRight size={15} aria-hidden="true" />
            </a>
          </div>
          <div className="homeHeroProductFrame">
            <div className="homeHeroProductBar">
              <span><Globe2 size={14} aria-hidden="true" /> 지금 여기서 실행</span>
              <span>설치 없음 · 실시간</span>
            </div>
            <LiveCodeCell className="homeHeroLiveCell" />
            <ProductVisual
              assetId="runLearningHero"
              className="homeHeroProductVisual homeHeroProductVisualMobile"
              eager
              width={390}
            />
            <dl className="homeHeroProofRail">
              <div><dt>Web 레슨</dt><dd>{curriculumRuntimeCounts.browser}</dd></div>
              <div><dt>Local 레슨</dt><dd>{curriculumRuntimeCounts.local}</dd></div>
              <div><dt>흐름</dt><dd>코드 → 자동화</dd></div>
            </dl>
          </div>
        </div>
      </section>

      <section className="homeProofLoop" aria-labelledby="proof-loop-title">
        <div className="homeShell homeProofLayout">
          <div className="homeProofProduct">
            <ProductVisual assetId="runLearningDetail" className="homeProofProductVisual" width={900} />
            <p><CheckCircle2 size={16} aria-hidden="true" /> 설명부터 실행·검증 결과까지, 실제 Codaro 레슨 한 화면입니다.</p>
          </div>
          <div>
            <header className="homeSectionHeading homeSectionHeadingCompact">
              <span className="homeKicker">한 사이클로 익힌다</span>
              <Heading id="proof-loop-title" level={2}>읽고, 고치고, 실행하면 검증이 잡는다.</Heading>
              <Text color="secondary">
                학습을 끊지 않습니다. 실행하면 결과와 피드백, 다음 단계가 같은 흐름에 나타나 틀린 걸 그 자리에서 고칩니다.
              </Text>
            </header>
            <ol className="homeProofSteps">
              {proofSteps.map((step, index) => (
                <li key={step.label}>
                  <span className="homeProofIndex">{String(index + 1).padStart(2, "0")}</span>
                  <step.icon size={18} aria-hidden="true" />
                  <span>
                    <small>{step.label}</small>
                    <strong>{step.title}</strong>
                    <p>{step.copy}</p>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="homeOutcomeBand" aria-labelledby="outcome-title">
        <div className="homeShell">
          <header className="homeSectionHeading">
            <span className="homeKicker">어디까지 갈까</span>
            <Heading id="outcome-title" level={2}>기초에서 자동화까지, 한 경로로 칼퇴까지.</Heading>
            <Text color="secondary">
              문법 목록이 아니라 만들 결과에서 시작합니다. 경로마다 Web에서 끝낼 범위와 Local로 확장할 지점을 처음부터 정직하게 보여줍니다.
            </Text>
          </header>
          <div className="homeOutcomeStories">
            {outcomeStories.map((story) => (
              <a href={story.href} className="homeOutcomeStory" key={story.title}>
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
            <span className="homeKicker">Web에서 익히고, Local에서 일하게 한다</span>
            <Heading id="runtime-title" level={2}>브라우저로 배우고, 같은 코드로 내 환경을 자동화합니다.</Heading>
            <Text color="secondary">
              {curriculumRuntimeCounts.browser}개 레슨은 브라우저에서 실행·강검증·진도까지 끝냅니다. 파일·일정·운영체제 권한이 필요한 {curriculumRuntimeCounts.local}개 레슨은 Local 필요를 미리 표시하고, Web에서 익힌 코드를 그대로 이어갑니다.
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
            <div className="homeRuntimeVisuals" aria-label="Local 노트북과 자동화 제품 화면">
              <figure className="homeRuntimeFigure">
                <figcaption>LOCAL 노트북</figcaption>
                <ProductVisual assetId="localNotebookDesktop" className="homeRuntimeImage" width={900} />
              </figure>
              <figure className="homeRuntimeFigure">
                <figcaption>LOCAL 자동화</figcaption>
                <ProductVisual assetId="localAutomationDesktop" className="homeRuntimeImage" width={900} />
              </figure>
            </div>
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
            <Heading id="trust-title" level={2}>배운 코드는 내 것이고, 내 통제 안에 있습니다.</Heading>
            <Text color="secondary">
              학습한 Python은 일반 파일로 그대로 남고, Local 릴리즈는 체크섬·manifest·SBOM을 함께 제공합니다. 장소에 구애받지 않고, 어디서든 같은 코드를 다시 실행합니다.
            </Text>
          </div>
          <a href={brand.releaseUrl}>릴리즈 검증하기 <ArrowRight size={16} aria-hidden="true" /></a>
        </div>
      </section>
    </main>
  );
}
