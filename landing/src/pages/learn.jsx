// learn.jsx - /learn 학습 페이지. astryx 디자인. App.jsx와 prerenderReact.js가 공유하는 SSOT.
// 커리큘럼 트리는 빌드시 생성(scripts/generateCurriculum.js). 레슨 실행(브라우저 런타임)은 P3에서 배선.
import { useRef, useState } from "react";
import { BookOpen, Download, Globe, Play, Sparkles } from "lucide-react";
import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";
import { Button } from "@astryxdesign/core/Button";
import { Badge } from "@astryxdesign/core/Badge";
import { Card } from "@astryxdesign/core/Card";
import { brand } from "../lib/brand.js";
import { curriculumTree, curriculumLessonCount } from "../lib/generated/curriculum.js";
import { PythonRunner } from "../components/pythonRunner.jsx";

export function LearnPage() {
  const [loaded, setLoaded] = useState(null);
  const nonceRef = useRef(0);

  function runLesson(lesson) {
    if (!lesson || !lesson.code) return;
    setLoaded({ code: lesson.code, title: lesson.title, direction: lesson.direction, nonce: (nonceRef.current += 1) });
    if (typeof document !== "undefined") {
      const el = document.getElementById("py-runner");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <main className="learnPage">
      <section className="homeWrap homeHero" style={{ paddingBlock: "84px 40px" }}>
        <Badge variant="accent" label="CODARO ANYWHERE · 학습" icon={<Globe size={13} aria-hidden="true" />} />
        <div className="homeHeroHeadline">
          <Heading level={1} type="display-2">브라우저에서 배우는 Python.</Heading>
        </div>
        <div className="homeHeroLead">
          <Text type="body-lg" color="muted">
            {curriculumLessonCount}개 공개 레슨, {curriculumTree.length}개 도메인. 설명·예측·실행·검증이 한
            학습 카드 안에서 끊기지 않습니다. 곧 브라우저 탭에서 진짜 Python으로 바로 실행됩니다.
          </Text>
        </div>
        <div className="homeHeroActions">
          <Button
            as="a"
            href={brand.launcherDownloadUrl}
            variant="primary"
            size="lg"
            label="로컬로 완전하게 시작"
            icon={<Download size={17} aria-hidden="true" />}
          />
          <Button as="a" href="#curriculum" variant="secondary" size="lg" label="커리큘럼 보기" icon={<BookOpen size={16} aria-hidden="true" />} />
        </div>
        <Text type="body-sm" color="subtle">
          <Sparkles size={13} style={{ verticalAlign: "-2px", marginRight: 6 }} aria-hidden="true" />
          레슨 실행 런타임(브라우저 Python)은 배선 중입니다. 지금은 로컬에서 완전 동작합니다.
        </Text>
      </section>

      <section id="py-runner" className="homeWrap homeSection" style={{ paddingBlock: "16px 40px" }}>
        <div className="homeSectionHead">
          <Text type="label" color="accent">지금 바로</Text>
          <Heading level={2} type="display-3">브라우저에서 Python을 실행해보세요.</Heading>
          <Text type="body" color="muted">
            설치도 서버도 없습니다. 아래 코드를 고쳐서 실행하거나, 커리큘럼에서 레슨을 눌러 그 코드를 여기로
            불러오세요. 이 탭 안에서 진짜 CPython이 돕니다.
          </Text>
        </div>
        {loaded && loaded.title && (
          <div className="learnActiveLesson">
            <Badge variant="accent" label="레슨" />
            <div>
              <Text type="body-sm" weight="600">{loaded.title}</Text>
              {loaded.direction && <Text type="body-sm" color="muted">{loaded.direction}</Text>}
            </div>
          </div>
        )}
        <PythonRunner load={loaded} />
      </section>

      <section className="homeWrap homeSection" id="curriculum" style={{ paddingTop: 20 }}>
        <div className="learnDomainNav">
          {curriculumTree.map((d) => (
            <a key={d.domain} className="learnDomainChip" href={`#domain-${d.domain}`}>
              {d.label}
              <span>{d.count}</span>
            </a>
          ))}
        </div>

        {curriculumTree.map((domain) => (
          <div key={domain.domain} id={`domain-${domain.domain}`} className="learnDomain">
            <div className="homeSectionHead" style={{ marginBottom: 22 }}>
              <Text type="label" color="accent">{domain.count}개 레슨 · {domain.tracks.length}개 트랙</Text>
              <Heading level={2} type="display-3">{domain.label}</Heading>
            </div>
            {domain.tracks.map((track) => (
              <div key={track.track} className="learnTrack">
                <Heading level={3} type="title">{track.track}</Heading>
                <div className="learnLessonGrid">
                  {track.lessons.map((lesson) => (
                    <button
                      key={lesson.slug}
                      type="button"
                      className="learnLessonButton"
                      disabled={!lesson.code}
                      title={lesson.code ? "이 레슨의 코드를 실행기로 불러오기" : "실행 코드 없음"}
                      onClick={() => runLesson(lesson)}
                    >
                      <Card padding={4}>
                        <div className="learnLessonCard">
                          <span className="learnLessonEmoji" aria-hidden="true">{lesson.emoji || "•"}</span>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <Text type="body-sm" weight="600">{lesson.title}</Text>
                            {lesson.tags.length > 0 && (
                              <div className="learnLessonTags">
                                {lesson.tags.slice(0, 3).map((t) => (
                                  <span key={t} className="learnTag">{t}</span>
                                ))}
                              </div>
                            )}
                          </div>
                          {lesson.code && <Play size={14} className="learnLessonPlay" aria-hidden="true" />}
                        </div>
                      </Card>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </section>
    </main>
  );
}
