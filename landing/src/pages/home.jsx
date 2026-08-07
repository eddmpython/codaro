import { ChevronDown, Globe2, Play } from "lucide-react";
import { Button } from "@astryxdesign/core/Button";
import { Heading } from "@astryxdesign/core/Heading";

import { LearningStudio } from "../components/learningStudio.jsx";
import { LiveCodeCell } from "../components/liveCodeCell.jsx";
import { curriculumLessonCount, curriculumRuntimeCounts, curriculumTree } from "../lib/generated/curriculum.js";
import { firstLessonHref } from "../lib/learningCatalog.js";

// 홈은 세로로 쌓는 세 층이다. 각 층은 본문 칸 전체를 쓴다.
//   1) 히어로: 격자 폭을 다 쓰는 큰 헤드라인 한 덩어리. 옆에 아무것도 두지 않는다.
//   2) 실행 띠: 실제로 Python 이 도는 셀. 말이 아니라 물건으로 증명하는 자리다.
//   3) 학습창: 이어서 하거나 목표를 고르는 자리.
// 히어로를 좌우로 쪼개면 헤드라인이 절반 칸에 갇혀 크기를 못 키운다. 그래서
// 옆에 세우지 않고 아래로 내렸다. 층마다 좌우 세로선이 같은 x 로 이어진다.
export function HomePage() {
  const curriculumUrl = firstLessonHref();
  return (
    <main className="homeAstryx homeContinuous">
      <section className="homeProductHero" aria-labelledby="home-title">
        <div className="homeShell homeHeroLayout">
          <span className="homeKicker">Python 학습 스튜디오</span>
          <Heading id="home-title" level={1} className="homeHeroHeadline">
            <span>어디서나 공부한다.</span>
            <span className="homeHeroHeadlineAccent">자동화를 배운다.</span>
          </Heading>
          <p className="homeProductStatement">
            설치도 가입도 없이, 이 페이지에서 Python이 그대로 실행됩니다.
          </p>

          <div className="homeHeroActions">
            <Button
              as="a"
              className="homeHeroPrimaryAction"
              href={curriculumUrl}
              variant="primary"
              size="lg"
              label="첫 레슨으로 시작하기"
              icon={<Play size={18} aria-hidden="true" />}
            />
            <Button
              as="a"
              className="homeHeroSecondaryAction"
              href="#studio"
              variant="secondary"
              size="lg"
              label="학습창 열기"
              icon={<Globe2 size={18} aria-hidden="true" />}
            />
          </div>
        </div>
      </section>

      <section className="homeProofBand" aria-label="교육과정 규모">
        <div className="homeShell homeProofLayout">
          <dl className="homeStudioSummary">
            <div><dt>Web</dt><dd>{curriculumRuntimeCounts.browser}</dd></div>
            <div><dt>Local</dt><dd>{curriculumRuntimeCounts.local}</dd></div>
            <div><dt>전체 레슨</dt><dd>{curriculumLessonCount}</dd></div>
            <div><dt>분야</dt><dd>{curriculumTree.length}</dd></div>
          </dl>
        </div>
      </section>

      <section className="homeRunBand" aria-labelledby="home-run-title">
        <div className="homeShell homeRunLayout">
          <div className="homeRunHead">
            <span className="homeKicker">브라우저에서 실행</span>
            <h2 id="home-run-title">고치고 실행하면 바로 결과가 나옵니다.</h2>
          </div>
          <div className="homeHeroProductFrame">
            <LiveCodeCell className="homeHeroLiveCell" />
          </div>
          <p className="homeHeroScrollCue" aria-hidden="true">
            <ChevronDown size={16} />
            아래로 내리면 학습창
          </p>
        </div>
      </section>

      <LearningStudio />
    </main>
  );
}
