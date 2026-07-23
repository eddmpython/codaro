// generateCurriculum.js - 커리큘럼 SSOT(../../curricula/python)를 읽어
// 랜딩 학습 페이지용 인덱스(src/lib/generated/curriculum.js)를 생성한다.
// docsNav/posts 생성기와 같은 패턴. 빌드 prebuild 단계에서 돈다.
import { basename, dirname, extname, resolve, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { parse as parseYaml } from "yaml";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CURRICULA = resolve(__dirname, "../../curricula/python");
const TAXONOMY = resolve(CURRICULA, "_taxonomy.yml");
const PUBLIC_LEARNING_CATALOG = resolve(__dirname, "../../contracts/publicLearningCatalog.json");
const OUT = resolve(__dirname, "../src/lib/generated/curriculum.js");
const LESSON_OUT = resolve(__dirname, "../src/lib/generated/curriculumLessons");
const RETRYABLE_WRITE_CODES = new Set(["EACCES", "EBUSY", "EPERM", "UNKNOWN"]);

function sleepSync(milliseconds) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, milliseconds);
}

function writeGeneratedFile(path, content) {
  for (let attempt = 0; attempt < 6; attempt += 1) {
    try {
      writeFileSync(path, content);
      return;
    } catch (error) {
      if (!RETRYABLE_WRITE_CODES.has(error?.code) || attempt === 5) throw error;
      sleepSync(50 * (attempt + 1));
    }
  }
}

const DOMAIN_LABELS = {
  basics: "파이썬 기초",
  dataAnalysis: "데이터 분석",
  visualization: "시각화",
  mathStatsMl: "수학 · 통계 · ML",
  imageVision: "이미지 · 비전",
  automation: "자동화",
  devLiteracy: "개발 리터러시",
  aiIntegration: "AI 통합",
};
const DOMAIN_ORDER = Object.keys(DOMAIN_LABELS);
const DOMAIN_VISUALS = {
  basics: "pythonFundamentals",
  dataAnalysis: "dataAnalysis",
  visualization: "dataVisualization",
  mathStatsMl: "statisticsMachineLearning",
  imageVision: "imageVision",
  automation: "learningAutomation",
  devLiteracy: "developerLiteracy",
  aiIntegration: "aiIntegration",
};

function walkYaml(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    if (entry.startsWith("_") || entry === "__pycache__") continue;
    const full = resolve(dir, entry);
    if (statSync(full).isDirectory()) walkYaml(full, acc);
    else if ((entry.endsWith(".yaml") || entry.endsWith(".yml")) && entry !== "schema.yaml") acc.push(full);
  }
  return acc;
}

function domainOf(fileRel) {
  return fileRel.split(/[\\/]/)[0];
}

const files = existsSync(CURRICULA) ? walkYaml(CURRICULA) : [];
const contentContracts = loadContentContracts(PUBLIC_LEARNING_CATALOG);
const taxonomy = parseYaml(readFileSync(TAXONOMY, "utf8"));
const lessonOutcomeBackfill = taxonomy?.lessonOutcomes && typeof taxonomy.lessonOutcomes === "object"
  ? taxonomy.lessonOutcomes
  : {};
const domains = new Map();
let lessonCount = 0;

rmSync(LESSON_OUT, { force: true, recursive: true });
mkdirSync(LESSON_OUT, { recursive: true });

for (const file of files) {
  let doc;
  try {
    doc = parseYaml(readFileSync(file, "utf8"));
  } catch (err) {
    console.warn(`[curriculum] YAML 파싱 건너뜀: ${relative(CURRICULA, file)} (${String(err).slice(0, 80)})`);
    continue;
  }
  const meta = doc && doc.meta;
  if (!meta || !meta.id || !meta.title) continue;
  const rel = relative(CURRICULA, file);
  const domain = domainOf(rel);
  const track = meta.category || "기타";
  const contentId = basename(file, extname(file));
  if (!safeRouteSegment(String(track)) || !safeRouteSegment(contentId)) {
    throw new Error(`[curriculum] unsafe public lesson route segment: ${track}/${contentId}`);
  }
  const lessonRef = `${track}/${contentId}`;
  const contentContract = contentContracts.get(lessonRef);
  if (!contentContract) throw new Error(`[curriculum] canonical content contract missing: ${lessonRef}`);
  const backfill = lessonOutcomeBackfill[lessonRef] || {};
  const outcomes = stringList(meta.outcomes).length ? stringList(meta.outcomes) : stringList(backfill.outcomes);
  const prerequisites = Array.isArray(meta.prerequisites)
    ? stringList(meta.prerequisites)
    : stringList(backfill.prerequisites);
  const estimatedMinutes = positiveInteger(meta.estimatedMinutes ?? backfill.estimatedMinutes, 0);
  if (!outcomes.length || !estimatedMinutes) {
    throw new Error(`[curriculum] learning outcome/time contract missing: ${lessonRef}`);
  }
  const contentModule = `${String(track).replace(/[^A-Za-z0-9_-]/g, "-")}--${contentId.replace(/[^A-Za-z0-9_-]/g, "-")}`;
  const sections = Array.isArray(doc.sections)
    ? doc.sections.map((section, index) => compactSection(section, index))
    : [];
  const lesson = {
    id: contentId,
    metaId: String(meta.id),
    title: String(meta.title),
    track: String(track),
    tags: Array.isArray(meta.tags) ? meta.tags.slice(0, 6).map(String) : [],
    direction: (doc.intro && doc.intro.direction) || (meta.seo && meta.seo.description) || "",
    estimatedMinutes,
    outcome: outcomes,
    prerequisites,
    runtimeTier: contentContract.runtimeTier,
    eligiblePathIds: contentContract.eligiblePathIds,
    visualAssetId: DOMAIN_VISUALS[domain] || "runLearningDetail",
    contentModule,
    route: `/learn/lesson/${String(track)}/${contentId}`,
    slug: `${domain}/${track}/${contentId}`,
  };
  const lessonPayload = {
    ...lesson,
    domain,
    domainLabel: DOMAIN_LABELS[domain] || domain,
    intro: {
      benefits: stringList(doc.intro?.benefits),
      direction: lesson.direction,
      points: stringList(doc.intro?.points),
    },
    packages: stringList(meta.packages),
    sections,
    seo: {
      description: String(meta.seo?.description || lesson.direction || `${lesson.title} Python 레슨`),
      keywords: stringList(meta.seo?.keywords),
      title: String(meta.seo?.title || lesson.title),
    },
    checkSpecId: contentContract.checkSpecId,
  };
  writeGeneratedFile(
    resolve(LESSON_OUT, `${contentModule}.js`),
    `// GENERATED by scripts/generateCurriculum.js - 직접 편집 금지.\nexport default ${JSON.stringify(lessonPayload, null, 2)};\n`,
  );
  if (!domains.has(domain)) domains.set(domain, new Map());
  const tracks = domains.get(domain);
  if (!tracks.has(track)) tracks.set(track, []);
  tracks.get(track).push(lesson);
  lessonCount += 1;
}

if (lessonCount !== contentContracts.size) {
  throw new Error(`[curriculum] public learning catalog mismatch: curricula=${lessonCount} contracts=${contentContracts.size}`);
}

const tree = DOMAIN_ORDER.filter((d) => domains.has(d)).map((domain) => {
  const tracks = domains.get(domain);
  const trackList = [...tracks.entries()].map(([track, lessons]) => ({
    track,
    lessons: lessons.sort((a, b) => a.id.localeCompare(b.id, "en", { numeric: true })),
  }));
  const count = trackList.reduce((n, t) => n + t.lessons.length, 0);
  return { domain, label: DOMAIN_LABELS[domain] || domain, count, tracks: trackList };
});
const runtimeCounts = { browser: 0, local: 0 };
for (const domain of tree) {
  for (const track of domain.tracks) {
    for (const lesson of track.lessons) runtimeCounts[lesson.runtimeTier] += 1;
  }
}

const banner = "// GENERATED by scripts/generateCurriculum.js - 직접 편집 금지. SSOT=curricula/python.";
writeGeneratedFile(
  OUT,
  `${banner}\nexport const curriculumTree = ${JSON.stringify(tree, null, 2)};\nexport const curriculumLessons = curriculumTree.flatMap((domain) => domain.tracks.flatMap((track) => track.lessons.map((lesson) => ({ ...lesson, domain: domain.domain, domainLabel: domain.label }))));\nexport const curriculumRuntimeCounts = ${JSON.stringify(runtimeCounts)};\nexport const curriculumLessonCount = ${lessonCount};\n`,
);
console.log(`[curriculum] domains=${tree.length} lessons=${lessonCount} -> ${relative(resolve(__dirname, ".."), OUT)}`);

function compactSection(value, index) {
  const section = value && typeof value === "object" ? value : {};
  const exercise = section.exercise && typeof section.exercise === "object" ? section.exercise : {};
  const check = section.check && typeof section.check === "object" ? section.check : {};
  return {
    id: String(section.id || `section-${index + 1}`),
    title: String(section.title || `섹션 ${index + 1}`),
    subtitle: String(section.subtitle || ""),
    goal: String(section.goal || ""),
    why: String(section.why || ""),
    explanation: String(section.explanation || ""),
    snippet: String(section.snippet || ""),
    tips: stringList(section.tips),
    exercise: {
      prompt: String(exercise.prompt || ""),
      starterCode: String(exercise.starterCode || ""),
      hints: stringList(exercise.hints),
    },
    check: {
      id: String(check.id || ""),
      strength: String(check.strength || (check.id ? "strong" : "")),
    },
  };
}

function stringList(value) {
  return Array.isArray(value) ? value.filter((item) => item != null).map(String) : [];
}

function positiveInteger(value, fallback) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : fallback;
}

function safeRouteSegment(value) {
  return Boolean(value) && value !== "." && value !== ".." && !/[\\/%?#:]/.test(value);
}

function loadContentContracts(path) {
  if (!existsSync(path)) throw new Error(`[curriculum] public learning catalog missing: ${path}`);
  const catalog = JSON.parse(readFileSync(path, "utf8"));
  if (catalog?.schemaVersion !== 1 || catalog?.canonicalIdentity !== "category/contentId" || !Array.isArray(catalog?.lessons)) {
    throw new Error("[curriculum] public learning catalog header is invalid");
  }
  const contracts = new Map();
  for (const row of catalog.lessons) {
    const lessonRef = String(row?.lessonRef || "");
    const runtimeTier = row?.runtimeTier === "browser" ? "browser" : row?.runtimeTier === "local" ? "local" : "";
    const eligiblePathIds = stringList(row?.eligiblePathIds);
    const checkSpecId = String(row?.checkSpecId || "");
    if (!lessonRef || !runtimeTier || !eligiblePathIds.length || !checkSpecId) {
      throw new Error(`[curriculum] invalid public learning contract: ${lessonRef || "unknown lesson"}`);
    }
    if (contracts.has(lessonRef)) throw new Error(`[curriculum] duplicate public learning contract: ${lessonRef}`);
    contracts.set(lessonRef, { checkSpecId, eligiblePathIds, runtimeTier });
  }
  return contracts;
}
