import { ChevronDown, Globe2, Play } from "lucide-react";
import { Button } from "@astryxdesign/core/Button";
import { Heading } from "@astryxdesign/core/Heading";

import { LearningStudio } from "../components/learningStudio.jsx";
import { LiveCodeCell } from "../components/liveCodeCell.jsx";
import { firstLessonHref } from "../lib/learningCatalog.js";

// 홈은 두 칸이다. 첫 화면은 히어로 한 장, 스크롤하면 학습창.
// 히어로는 sticky로 제자리에 서 있고 학습창이 그 위를 덮으며 올라온다.
// 광고 섹션을 늘어놓지 않는다. 보는 화면에서 하는 화면으로 한 번에 넘어간다.
// 반응형: 760px 아래에서는 sticky를 풀고 두 칸을 그냥 세로로 잇는다.
export function HomePage() {
  const curriculumUrl = firstLessonHref();

  return (
    <main className="homeAstryx homeContinuous">
      <section className="homeProductHero" aria-labelledby="home-title">
        <div className="homeShell homeHeroLayout">
          <Heading id="home-title" level={1} className="homeHeroHeadline">
            <span>바로 공부한다.</span>
            <span>어디서나 공부한다.</span>
            <span className="homeHeroHeadlineAccent">자동화를 배운다.</span>
          </Heading>
          <p className="homeProductStatement">
            설치도 가입도 없이, 이 페이지에서 Python이 그대로 실행됩니다.
          </p>

          <div className="homeHeroProductFrame">
            <LiveCodeCell className="homeHeroLiveCell" />
          </div>

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
