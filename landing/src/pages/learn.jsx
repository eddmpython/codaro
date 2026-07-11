// learn.jsx - /learn 커리큘럼 카탈로그. astryx 정본 조합(home.jsx와 같은 셸/VStack/Grid 패턴).
// 커리큘럼 트리는 빌드시 생성(scripts/generateCurriculum.js). 레슨 실행은 Codaro 에디터에서 한다.
import { BookOpen, Download, Layers } from "lucide-react";
import { VStack, HStack } from "@astryxdesign/core/Layout";
import { Grid } from "@astryxdesign/core/Grid";
import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";
import { Button } from "@astryxdesign/core/Button";
import { Badge } from "@astryxdesign/core/Badge";
import { Card } from "@astryxdesign/core/Card";
import { brand } from "../lib/brand.js";
import { curriculumTree, curriculumLessonCount } from "../lib/generated/curriculum.js";

export function LearnPage() {
  return (
    <main className="homeAstryx learnPage">
      <div className="homeShell homeHeroPad">
        <VStack gap={6} hAlign="center">
          <Badge variant="accent" label="CURRICULUM" icon={<Layers size={13} aria-hidden="true" />} />
          <Heading level={1} type="display-2" justify="center" textWrap="balance">
            배우고 바로 일하게 되는 Python 커리큘럼.
          </Heading>
          <VStack maxWidth={620} hAlign="center">
            <Text type="body" color="secondary" justify="center" textWrap="balance">
              {curriculumLessonCount}개 공개 레슨, {curriculumTree.length}개 도메인. 설명, 예측, 실행, 검증이
              하나의 학습 카드 안에서 끊기지 않습니다. 레슨은 Codaro 에디터에서 실행하며 배웁니다.
            </Text>
          </VStack>
          <HStack gap={3} justify="center">
            <Button as="a" href={brand.launcherDownloadUrl} variant="primary" size="lg" label="Codaro로 시작" icon={<Download size={17} aria-hidden="true" />} />
            <Button as="a" href="#curriculum" variant="secondary" size="lg" label="커리큘럼 보기" icon={<BookOpen size={16} aria-hidden="true" />} />
          </HStack>
        </VStack>
      </div>

      <div className="homeShell homeSectionPad" id="curriculum">
        <div className="learnDomainNav">
          {curriculumTree.map((d) => (
            <a key={d.domain} className="learnDomainChip" href={`#domain-${d.domain}`}>
              {d.label}
              <span>{d.count}</span>
            </a>
          ))}
        </div>

        <VStack gap={12}>
          {curriculumTree.map((domain) => (
            <div key={domain.domain} id={`domain-${domain.domain}`} className="learnDomain">
              <VStack gap={6}>
                <VStack gap={2} hAlign="start">
                  <Text type="label" color="secondary">{domain.count}개 레슨 · {domain.tracks.length}개 트랙</Text>
                  <Heading level={2} type="display-3">{domain.label}</Heading>
                </VStack>
                {domain.tracks.map((track) => (
                  <VStack key={track.track} gap={3}>
                    <Heading level={3}>{track.track}</Heading>
                    <Grid columns={{ minWidth: 240 }} gap={3}>
                      {track.lessons.map((lesson) => (
                        <Card key={lesson.slug} padding={4}>
                          <HStack gap={3} vAlign="start">
                            <span className="learnLessonEmoji" aria-hidden="true">{lesson.emoji || "•"}</span>
                            <VStack gap={2}>
                              <Text type="body" weight="600">{lesson.title}</Text>
                              {lesson.tags.length > 0 && (
                                <div className="learnLessonTags">
                                  {lesson.tags.slice(0, 3).map((t) => (
                                    <span key={t} className="learnTag">{t}</span>
                                  ))}
                                </div>
                              )}
                            </VStack>
                          </HStack>
                        </Card>
                      ))}
                    </Grid>
                  </VStack>
                ))}
              </VStack>
            </div>
          ))}
        </VStack>
      </div>
    </main>
  );
}
