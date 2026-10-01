import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parse } from "yaml";
import { sectionContent } from "./curriculumSections.mjs";

const lesson = parse(readFileSync(new URL("../../curricula/python/automation/office/pdf/04_표추출.yaml", import.meta.url), "utf8"));
const sections = lesson.sections.map(sectionContent);
assert.equal(sections.flatMap((section) => section.contentBlocks).filter((block) => block.type === "image").length, 6);
assert.match(sections[0].explanationHtml, /href="https:\/\/raw.githubusercontent.com\/eddmpython\/codaro\/main\/demos\/pdfTables\/pdfTables.py"/);
assert.match(sections.at(-1).contentBlocks[0].html, /requirements.txt/);
assert.match(sections.at(-2).contentBlocks[1].html, /4,809,000/);
assert.equal(sectionContent({}).explanationHtml, "");
assert.deepEqual(sectionContent({}).contentBlocks, []);

// 강의장에서 연결하는 읽기 자료가 빈 섹션으로 나오면 안 된다.
for (const lesson of ["githubIntro", "commandLineIntro", "projectRules"]) {
  const source = parse(readFileSync(new URL(`../../curricula/python/devLiteracy/devTools/${lesson}.yaml`, import.meta.url), "utf8"));
  for (const section of source.sections) {
    const rendered = sectionContent(section).contentBlocks;
    assert.equal(rendered.length, section.blocks.length, `${lesson}/${section.id}: 읽기 블록 누락`);
    assert.ok(rendered.every(block => block.html || block.assetId));
  }
}
console.log("공개 PDF 학습 페이지: 섹션 이미지 6개, 준비 파일 링크, 결과 설명, 참고 목록 보존");
