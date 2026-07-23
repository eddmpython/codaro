import {
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Download,
  Globe2,
  Laptop,
  ShieldCheck,
  SquareTerminal,
  Workflow,
} from "lucide-react";
import { Badge } from "@astryxdesign/core/Badge";
import { Button } from "@astryxdesign/core/Button";
import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";
import { brand } from "../lib/brand.js";
import { faqEntries } from "../lib/faq.js";
import { ProductVisual } from "../components/productVisual.jsx";
import { curriculumRuntimeCounts } from "../lib/generated/curriculum.js";

const appPath = (path = "/") => brand.appPath(path);

const learningSteps = [
  {
    icon: BookOpen,
    index: "01",
    title: "완성 예제로 이해",
    copy: "목표와 설명 다음에 실제 입력과 결과를 함께 보여줘 개념의 쓰임을 먼저 이해합니다.",
  },
  {
    icon: SquareTerminal,
    index: "02",
    title: "바로 실행",
    copy: "설치 없이 브라우저 Python으로 같은 화면에서 결과와 오류를 확인합니다.",
  },
  {
    icon: CheckCircle2,
    index: "03",
    title: "자동 피드백으로 수정",
    copy: "실행하면 결과, 오류, 강검증이 같은 흐름에서 갱신되고 다음 수정 지점을 바로 안내합니다.",
  },
  {
    icon: Workflow,
    index: "04",
    title: "로컬 자동화로 확장",
    copy: "검증된 코드는 파일, 터미널, 스케줄러를 쓰는 반복 작업으로 이어집니다.",
  },
];

const capabilityRows = [
  {
    label: "단계형 Python 커리큘럼",
    web: "브라우저에서 학습과 실행",
    local: "동일 콘텐츠와 로컬 파일 연결",
  },
  {
    label: "채팅과 셀 에디터",
    web: "브라우저 런타임으로 실행",
    local: "내 Python 환경에서 완전 실행",
  },
  {
    label: "파일과 터미널",
    web: "브라우저 샌드박스 범위",
    local: "실제 파일 시스템과 PTY",
  },
  {
    label: "지속 자동화",
    web: "작성과 dry-run 계획",
    local: "스케줄과 백그라운드 실행",
  },
];

const releaseLinks = [
  { href: brand.launcherChecksumUrl, label: "SHA256" },
  { href: brand.releaseManifestUrl, label: "Manifest" },
  { href: brand.launcherSbomUrl, label: "SBOM" },
  { href: brand.releaseUrl, label: "모든 릴리즈" },
];

function SectionHeading({ eyebrow, title, copy }) {
  return (
    <header className="homeSectionHeading">
      <Badge variant="accent" label={eyebrow} />
      <Heading level={2} type="display-3" textWrap="balance">{title}</Heading>
      {copy ? <Text type="body" color="secondary">{copy}</Text> : null}
    </header>
  );
}

export function HomePage() {
  const curriculumUrl = appPath("/learn");

  return (
    <main className="homeAstryx homeV2">
      <section className="homeProductHero" aria-labelledby="home-title">
        <ProductVisual assetId="webRunDesktop" className="homeProductHeroImage homeProductHeroImageDesktop" eager width={1440} />
        <ProductVisual assetId="runLearningMobile" className="homeProductHeroImage homeProductHeroImageMobile" eager width={390} />
        <div className="homeProductHeroShade" aria-hidden="true" />
        <div className="homeShell homeProductHeroContent">
          <Badge variant="neutral" label="WEB LEARNING + LOCAL AUTOMATION" />
          <Heading id="home-title" level={1}>Codaro</Heading>
          <p className="homeProductStatement">
            Python을 웹에서 바로 배우고 실행하세요.<br />
            검증된 코드는 로컬에서 더 강한 자동화가 됩니다.
          </p>
          <div className="homeHeroActions">
            <Button
              as="a"
              href={curriculumUrl}
              variant="primary"
              size="lg"
              label="웹에서 바로 학습"
              icon={<BookOpen size={18} aria-hidden="true" />}
            />
            <Button
              as="a"
              href={appPath("/run/")}
              variant="secondary"
              size="lg"
              label="웹 스튜디오 열기"
              icon={<Globe2 size={18} aria-hidden="true" />}
            />
          </div>
          <a className="homeLocalLink" href={brand.launcherDownloadUrl}>
            <Download size={16} aria-hidden="true" />
            Windows 로컬 앱 다운로드
            <ArrowRight size={15} aria-hidden="true" />
          </a>
        </div>
        <div className="homeHeroProof" aria-label="Codaro 핵심 범위">
          <span>설치 없는 Python 학습</span>
          <span>실행 가능한 교육 과정</span>
          <span>로컬 파일과 자동화 확장</span>
        </div>
      </section>

      <section className="homeProductBand">
        <div className="homeShell">
          <div className="homeProductCopy">
            <Badge variant="accent" label="ONE LEARNING PATH" />
            <Heading level={2} type="display-3" textWrap="balance">
              설명, 코드, 검증이 한 화면에서 이어집니다.
            </Heading>
            <Text type="body" color="secondary">
              긴 소개를 넘긴 뒤 실습을 찾게 하지 않습니다. 학습 목표 다음에 예제와 편집 가능한 코드가 나오고,
              실행 결과가 도착하면 같은 흐름에서 자동 검증합니다.
            </Text>
            <a className="homeInlineAction" href={appPath("/learn")}>
              전체 교육 과정 보기 <ArrowRight size={16} aria-hidden="true" />
            </a>
          </div>
          <div className="homeLearningProofGrid">
            <figure className="homeProductFigure homeProductFigureDetail">
              <ProductVisual assetId="runLearningDetail" width={900} />
              <figcaption>데스크톱 학습 화면: 설명 다음에 실행 가능한 코드와 강한 검증이 이어집니다.</figcaption>
            </figure>
            <figure className="homeProductFigure homeProductFigureMobile">
              <ProductVisual assetId="runLearningMobile" width={390} />
              <figcaption>모바일에서도 목표와 첫 실습이 같은 읽기 흐름에 있습니다.</figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section className="homeShell homeLearningSection">
        <SectionHeading
          eyebrow="LEARNING LOOP"
          title="클릭을 늘리지 않고, 학습 단계를 깊게 만든다."
          copy="필요한 설명과 실행 결과는 흐름 안에서 바로 보입니다. 사용자는 확인 버튼을 반복해서 누르는 대신 코드를 읽고 바꾸고 실행하는 데 집중합니다."
        />
        <ol className="homeLearningRail">
          {learningSteps.map((step) => (
            <li key={step.index} className="homeLearningStep">
              <div className="homeLearningStepTop">
                <span>{step.index}</span>
                <step.icon size={20} aria-hidden="true" />
              </div>
              <strong>{step.title}</strong>
              <p>{step.copy}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="homeLocalProofBand">
        <div className="homeShell">
          <SectionHeading
            eyebrow="LOCAL STUDIO"
            title="같은 코드를 내 파일과 반복 작업으로 확장합니다."
            copy="웹 학습을 끝내야만 다운로드할 수 있는 구조가 아닙니다. 필요할 때 같은 셀을 Local Studio에서 열어 프로젝트 파일, 시스템 Python, 예약 실행을 연결합니다."
          />
          <div className="homeLocalProofGrid">
            <figure className="homeProductFigure">
              <ProductVisual assetId="localNotebookDesktop" width={900} />
              <figcaption>Local Notebook: 시스템 Python, 프로젝트 파일, 터미널이 연결된 실행 환경</figcaption>
            </figure>
            <figure className="homeProductFigure">
              <ProductVisual assetId="localAutomationDesktop" width={1440} />
              <figcaption>Local Automation: 검증된 셀과 recipe를 파일 작업 및 예약 태스크로 운영</figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section className="homeCapabilityBand">
        <div className="homeShell">
          <SectionHeading
            eyebrow="WEB AND LOCAL"
            title="Web 지원 레슨은 완전한 학습 환경, Local은 더 넓은 실행 환경."
            copy={`${curriculumRuntimeCounts.browser}개 Web 지원 레슨은 읽기·실행·강검증·진도 저장까지 브라우저에서 완료합니다. 파일 시스템, 실제 터미널, 상주 스케줄처럼 운영체제 권한이 필요한 ${curriculumRuntimeCounts.local}개 레슨은 처음부터 Local 필요로 표시합니다.`}
          />
          <div className="homeCapabilityTable" role="table" aria-label="웹과 로컬 기능 비교">
            <div className="homeCapabilityHeader" role="row">
              <span role="columnheader">학습과 작업</span>
              <span role="columnheader"><Globe2 size={16} aria-hidden="true" /> 웹</span>
              <span role="columnheader"><Laptop size={16} aria-hidden="true" /> 로컬</span>
            </div>
            {capabilityRows.map((row) => (
              <div className="homeCapabilityRow" role="row" key={row.label}>
                <strong role="cell">{row.label}</strong>
                <span role="cell">{row.web}</span>
                <span role="cell">{row.local}</span>
              </div>
            ))}
          </div>
          <div className="homeCapabilityActions">
            <Button as="a" href={curriculumUrl} variant="primary" label="브라우저에서 시작" icon={<Globe2 size={17} aria-hidden="true" />} />
            <Button as="a" href={brand.launcherDownloadUrl} variant="secondary" label="로컬 앱 다운로드" icon={<Download size={17} aria-hidden="true" />} />
          </div>
        </div>
      </section>

      <section className="homeShell homeTrustSection">
        <div className="homeTrustIntro">
          <Badge variant="accent" label="VERIFIABLE RELEASE" />
          <Heading level={2} type="display-3" textWrap="balance">로컬 앱은 받기 전에 검증할 수 있습니다.</Heading>
          <Text type="body" color="secondary">
            실행 파일과 관리형 Python 런타임의 출처를 숨기지 않습니다. 체크섬, 버전 manifest, SBOM을 같은 릴리즈에서 확인할 수 있습니다.
          </Text>
        </div>
        <div className="homeTrustDetails">
          <p><ShieldCheck size={18} aria-hidden="true" /><span><strong>Local first</strong> 코드와 산출물은 내 PC에 남습니다.</span></p>
          <p><Check size={18} aria-hidden="true" /><span><strong>Inspectable</strong> 릴리즈 구성과 해시를 공개합니다.</span></p>
          <div className="homeReleaseLinks">
            {releaseLinks.map((link) => (
              <a href={link.href} key={link.href}>{link.label}<ArrowRight size={14} aria-hidden="true" /></a>
            ))}
          </div>
        </div>
      </section>

      <section className="homeFaqBand">
        <div className="homeShell homeFaqLayout">
          <SectionHeading eyebrow="FAQ" title="시작 전에 확인할 것" />
          <div>
            {faqEntries.map((entry, index) => (
              <details key={entry.question} className="homeFaqItem" open={index === 0}>
                <summary>{entry.question}</summary>
                <p>{entry.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="homeFinalBand">
        <div className="homeShell homeFinalInner">
          <div>
            <span>START IN THE BROWSER</span>
            <Heading level={2} type="display-3" textWrap="balance">첫 수업부터 바로 실행하세요.</Heading>
          </div>
          <Button
            as="a"
            href={curriculumUrl}
            variant="primary"
            size="lg"
            label="Python 학습 시작"
            icon={<BookOpen size={18} aria-hidden="true" />}
          />
        </div>
      </section>
    </main>
  );
}
