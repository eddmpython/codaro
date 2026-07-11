// learn.jsx - /learn 커리큘럼 카탈로그. astryx. App.jsx와 prerenderReact.js가 공유하는 SSOT.
// 커리큘럼 트리는 빌드시 생성(scripts/generateCurriculum.js). 레슨 실행은 Codaro 에디터에서 한다.
import { BookOpen, Download, Layers } from "lucide-react";
import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";
import { Button } from "@astryxdesign/core/Button";
import { Badge } from "@astryxdesign/core/Badge";
import { Card } from "@astryxdesign/core/Card";
import { brand } from "../lib/brand.js";
import { curriculumTree, curriculumLessonCount } from "../lib/generated/curriculum.js";

export function LearnPage() {
  return (
    <main className="learnPage">
      <section className="homeWrap homeHero" style={{ paddingBlock: "88px 44px" }}>
        <Badge variant="accent" label="CURRICULUM" icon={<Layers size={13} aria-hidden="true" />} />
        <div className="homeHeroHeadline">
          <Heading level={1} type="display-2">배우고 바로 일하게 되는 Python 커리큘럼.</Heading>
        </div>
        <div className="homeHeroLead">
          <Text type="body-lg" color="muted">
            {curriculumLessonCount}개 공개 레슨, {curriculumTree.length}개 도메인. 설명, 예측, 실행, 검증이
            하나의 학습 카드 안에서 끊기지 않습니다. 레슨은 Codaro 에디터에서 실행하며 배웁니다.
          </Text>
        </div>
        <div className="homeHeroActions">
          <Button as="a" href={brand.launcherDownloadUrl} variant="primary" size="lg" label="Codaro로 시작" icon={<Download size={17} aria-hidden="true" />} />
          <Button as="a" href="#curriculum" variant="secondary" size="lg" label="커리큘럼 보기" icon={<BookOpen size={16} aria-hidden="true" />} />
        </div>
      </section>

      <section className="homeWrap homeSection" id="curriculum" style={{ paddingTop: 8 }}>
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
                    <Card key={lesson.slug} padding={4}>
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
                      </div>
                    </Card>
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
