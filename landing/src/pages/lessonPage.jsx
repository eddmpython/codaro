// lessonPage.jsx - /learn/<slug> 레슨 상세. 클라이언트 렌더(직접 URL은 404.html SPA 폴백).
// static/lessons/<slug>.json(생성물)을 fetch해 섹션(설명 + 실행 셀)을 렌더. 셀은 상단 공유 실행기로 로드.
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Play } from "lucide-react";
import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { brand } from "../lib/brand.js";
import { PythonRunner } from "../components/pythonRunner.jsx";

const appPath = (path = "/") => brand.appPath(path);

export function LessonPage({ slug }) {
  const [lesson, setLesson] = useState(null);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(null);
  const nonceRef = useRef(0);

  useEffect(() => {
    let alive = true;
    setLesson(null);
    setError("");
    fetch(appPath(`/lessons/${slug}.json`))
      .then((r) => {
        if (!r.ok) throw new Error("레슨을 찾을 수 없습니다");
        return r.json();
      })
      .then((d) => { if (alive) setLesson(d); })
      .catch((e) => { if (alive) setError(String((e && e.message) || e)); });
    return () => { alive = false; };
  }, [slug]);

  function runCell(code) {
    if (!code) return;
    setLoaded({ code, nonce: (nonceRef.current += 1) });
    if (typeof document !== "undefined") {
      const el = document.getElementById("lesson-runner");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  if (error) {
    return (
      <main className="homeWrap homeSection">
        <Heading level={1} type="display-3">{error}</Heading>
        <div style={{ marginTop: 18 }}>
          <Button as="a" href={appPath("/learn")} variant="secondary" label="학습으로 돌아가기" icon={<ArrowLeft size={15} aria-hidden="true" />} />
        </div>
      </main>
    );
  }

  if (!lesson) {
    return (
      <main className="homeWrap homeSection">
        <Text type="body" color="muted">레슨을 불러오는 중...</Text>
      </main>
    );
  }

  const firstSnippet = lesson.sections.find((s) => s.snippet)?.snippet;

  return (
    <main className="lessonPage">
      <section className="homeWrap homeSection" style={{ paddingBlock: "40px 24px" }}>
        <Button as="a" href={appPath("/learn")} variant="ghost" size="sm" label="학습" icon={<ArrowLeft size={15} aria-hidden="true" />} />
        <div className="homeSectionHead" style={{ marginTop: 12 }}>
          <Text type="label" color="accent">{lesson.emoji ? `${lesson.emoji} ` : ""}레슨</Text>
          <Heading level={1} type="display-2">{lesson.title}</Heading>
          {lesson.direction && <Text type="body" color="muted">{lesson.direction}</Text>}
        </div>
        {lesson.intro && lesson.intro.points && lesson.intro.points.length > 0 && (
          <ul className="lessonPoints">
            {lesson.intro.points.map((p, i) => <li key={i}>{p}</li>)}
          </ul>
        )}
        <div id="lesson-runner" style={{ marginTop: 20 }}>
          <PythonRunner load={loaded} initialCode={firstSnippet || "# 이 레슨의 코드를 실행해보세요\nprint('안녕하세요')"} />
        </div>
      </section>

      <section className="homeWrap homeSection" style={{ paddingTop: 8 }}>
        <div className="lessonSections">
          {lesson.sections.map((s, i) => (
            <Card key={i} padding={5}>
              <div className="homeCardStack">
                {s.title && <Heading level={2} type="title">{s.title}</Heading>}
                {s.subtitle && <Text type="body-sm" color="subtle">{s.subtitle}</Text>}
                {s.why && <Text type="body-sm" color="muted">{s.why}</Text>}
                {s.explanation && <Text type="body" style={{ whiteSpace: "pre-wrap" }}>{s.explanation}</Text>}
                {s.snippet && (
                  <div className="lessonCell">
                    <pre className="lessonSnippet">{s.snippet}</pre>
                    <Button variant="primary" size="sm" label="이 코드 실행" icon={<Play size={14} aria-hidden="true" />} clickAction={() => runCell(s.snippet)} />
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
