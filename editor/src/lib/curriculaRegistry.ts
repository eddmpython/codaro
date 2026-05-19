import { parse } from "yaml";

import type {
  BlockConfig,
  CellDisplayKind,
  CellRole,
  CodaroDocument,
  CurriculumCategoriesPayload,
  CurriculumContentsPayload,
  CurriculumLessonPayload,
  ExecutionKind,
} from "@/types";

const rawCurricula = import.meta.glob("../../../curricula/python/**/*.yaml", {
  eager: true,
  import: "default",
  query: "?raw",
}) as Record<string, string>;

type RegistryLesson = {
  category: string;
  contentId: string;
  fileName: string;
  title: string;
  raw: string;
};

type YamlMap = Record<string, unknown>;

const categoryLabels: Record<string, { title: string; track: string; description: string }> = {
  main: {
    title: "파이썬 시작",
    track: "핵심",
    description: "Codaro에서 바로 시작하는 짧은 파이썬 입문 경로입니다.",
  },
  "30days": {
    title: "파이썬 기초",
    track: "핵심",
    description: "값, 흐름, 컬렉션, 파일, 작은 도구를 차례로 익히는 첫 경로입니다.",
  },
  advancedPython: {
    title: "고급 파이썬",
    track: "핵심",
    description: "패턴, 이터레이터, 데이터 모델, 타입, 유지보수 가능한 모듈을 다룹니다.",
  },
  builtins: {
    title: "표준 라이브러리",
    track: "핵심",
    description: "실행 가능한 셀로 파이썬 표준 라이브러리를 익힙니다.",
  },
  excel: {
    title: "엑셀 자동화",
    track: "자동화",
    description: "반복되는 워크북 작업을 Python 자동화로 바꿉니다.",
  },
  numpy: {
    title: "NumPy",
    track: "데이터",
    description: "배열, 벡터화, 수치 계산의 기본 흐름을 익힙니다.",
  },
  pandas: {
    title: "Pandas",
    track: "데이터",
    description: "실제 데이터로 정제, 조인, 그룹화, 변형, 리포팅을 익힙니다.",
  },
  duckdb: {
    title: "DuckDB",
    track: "데이터",
    description: "Python 안에서 로컬 SQL 분석을 수행합니다.",
  },
  polars: {
    title: "Polars",
    track: "데이터",
    description: "빠른 로컬 데이터프레임 워크플로를 익힙니다.",
  },
  pydantic: {
    title: "Pydantic",
    track: "데이터",
    description: "타입 기반 검증과 데이터 계약을 다룹니다.",
  },
  matplotlib: {
    title: "Matplotlib",
    track: "시각화",
    description: "로컬 Python의 기본 플로팅 흐름을 익힙니다.",
  },
  seaborn: {
    title: "Seaborn",
    track: "시각화",
    description: "접근하기 쉬운 API로 통계적 시각 분석을 다룹니다.",
  },
  plotly: {
    title: "Plotly",
    track: "시각화",
    description: "인터랙티브 차트와 대시보드를 만듭니다.",
  },
  altair: {
    title: "Altair",
    track: "시각화",
    description: "데이터 계약에서 출발하는 선언형 시각화를 익힙니다.",
  },
  folium: {
    title: "Folium",
    track: "시각화",
    description: "지도와 위치 데이터 시각화를 다룹니다.",
  },
  sympy: {
    title: "SymPy",
    track: "수학/ML",
    description: "기호 수학, 방정식, 변환을 다룹니다.",
  },
  scipy: {
    title: "SciPy",
    track: "수학/ML",
    description: "과학 계산, 신호 처리, 최적화를 다룹니다.",
  },
  statsmodels: {
    title: "Statsmodels",
    track: "수학/ML",
    description: "통계 모델링과 추론을 다룹니다.",
  },
  sklearn: {
    title: "Scikit-learn",
    track: "수학/ML",
    description: "로컬 Python 기반 머신러닝 워크플로를 익힙니다.",
  },
  networkx: {
    title: "NetworkX",
    track: "수학/ML",
    description: "그래프와 네트워크 분석을 다룹니다.",
  },
  regex: {
    title: "Regex",
    track: "텍스트",
    description: "텍스트 처리용 정규식을 익힙니다.",
  },
  pillow: {
    title: "Pillow",
    track: "이미지",
    description: "이미지 편집과 처리 흐름을 다룹니다.",
  },
  opencv: {
    title: "OpenCV",
    track: "이미지",
    description: "컴퓨터 비전의 기본 흐름을 익힙니다.",
  },
  practical: {
    title: "실전 파이썬",
    track: "프로젝트",
    description: "실행 가능한 Python 셀로 작은 프로젝트를 만듭니다.",
  },
};

const lessons = Object.entries(rawCurricula)
  .map(([path, raw]) => {
    const normalized = path.replace(/\\/g, "/");
    const match = normalized.match(/\/curricula\/python\/([^/]+)\/([^/]+\.yaml)$/);
    if (!match) return null;

    const [, category, fileName] = match;
    const contentId = fileName.replace(/\.yaml$/, "");
    return {
      category,
      contentId,
      fileName,
      raw,
      title: lessonTitleFromRaw(raw) || titleFromFileName(contentId),
    } satisfies RegistryLesson;
  })
  .filter((lesson): lesson is RegistryLesson => Boolean(lesson))
  .sort((left, right) => {
    if (left.category !== right.category) return left.category.localeCompare(right.category);
    return left.fileName.localeCompare(right.fileName, "ko", { numeric: true });
  });

const lessonPayloadCache = new Map<string, CurriculumLessonPayload>();

export function registryCategories(): CurriculumCategoriesPayload {
  const grouped = groupLessons();
  const categories = Object.entries(grouped).map(([key, items]) => ({
    key,
    name: categoryTitleFromRegistry(key),
    description: categoryLabels[key]?.description ?? `${categoryTitleFromRegistry(key)} 커리큘럼`,
    count: items.length,
  }));

  const groups = categories.reduce<Record<string, string[]>>((acc, category) => {
    const track = categoryLabels[category.key]?.track ?? "기타";
    acc[track] = [...(acc[track] ?? []), category.key];
    return acc;
  }, {});

  return {
    categories,
    groups,
    learningPaths: {
      Codaro: {
        categories: categories.map((category) => category.key),
        description: "curricula/python에 있는 기본 로컬 학습 커리큘럼입니다.",
      },
    },
  };
}

export function registryContents(category: string): CurriculumContentsPayload {
  const items = lessons.filter((lesson) => lesson.category === category);
  return {
    category,
    categoryName: categoryTitleFromRegistry(category),
    contents: items.map((lesson) => ({
      contentId: lesson.contentId,
      title: lesson.title,
    })),
  };
}

export function registryLesson(category: string, contentId: string): CurriculumLessonPayload | null {
  const lesson = lessons.find((item) => item.category === category && item.contentId === contentId);
  if (!lesson) return null;

  const cacheKey = `${category}/${contentId}`;
  const cached = lessonPayloadCache.get(cacheKey);
  if (cached) return cached;

  const document = documentFromCurriculumYaml(lesson.raw, category, contentId, lesson.title);
  const categoryLessons = lessons.filter((item) => item.category === category);
  const index = categoryLessons.findIndex((item) => item.contentId === contentId);

  const payload = {
    document,
    solutions: {},
    category,
    contentId,
    prevNext: {
      prev: index > 0 ? { contentId: categoryLessons[index - 1].contentId, title: categoryLessons[index - 1].title } : null,
      next: index >= 0 && index < categoryLessons.length - 1
        ? { contentId: categoryLessons[index + 1].contentId, title: categoryLessons[index + 1].title }
        : null,
    },
  };
  lessonPayloadCache.set(cacheKey, payload);
  return payload;
}

export function defaultRegistrySelection() {
  const preferred = lessons.find((lesson) => lesson.category === "30days") ?? lessons[0];
  return { category: preferred?.category ?? "30days", contentId: preferred?.contentId ?? "" };
}

function groupLessons() {
  return lessons.reduce<Record<string, RegistryLesson[]>>((acc, lesson) => {
    acc[lesson.category] = [...(acc[lesson.category] ?? []), lesson];
    return acc;
  }, {});
}

function documentFromCurriculumYaml(raw: string, category: string, contentId: string, fallbackTitle: string): CodaroDocument {
  const yaml = parseYaml(raw);
  const title = lessonTitle(yaml) || fallbackTitle;
  const blocks: BlockConfig[] = [];
  const intro = mapValue(yaml.intro);

  blocks.push(markdownBlock({
    content: introMarkdown(title, intro),
    displayKind: "hero",
    payload: { title, ...intro },
    role: "title",
    sourceType: "intro",
    title,
  }));

  for (const section of arrayOfMaps(yaml.sections)) {
    const sectionTitle = textValue(section.title);
    const sectionSubtitle = textValue(section.subtitle);
    if (sectionTitle || sectionSubtitle) {
      blocks.push(markdownBlock({
        content: [sectionTitle ? `## ${sectionTitle}` : "", sectionSubtitle].filter(Boolean).join("\n\n"),
        displayKind: "title",
        payload: { title: sectionTitle, subtitle: sectionSubtitle },
        role: "title",
        sourceType: "section",
        title: sectionTitle || sectionSubtitle,
      }));
    }

    for (const block of arrayOfMaps(section.blocks)) {
      blocks.push(...convertYamlBlock(block));
    }
  }

  return {
    id: `curriculum-${category}-${contentId}`,
    title,
    blocks: ensureUniqueBlockIds(blocks.length ? blocks : [markdownBlock({ content: `# ${title}`, role: "title", title })]),
    metadata: {
      sourceFormat: "curriculum",
      tags: [category, contentId],
    },
    runtime: {
      defaultEngine: "local",
      reactiveMode: "hybrid",
      packages: [],
    },
    app: {
      title,
      layout: "learning",
      hideCode: false,
      entryBlockIds: [],
    },
  };
}

function convertYamlBlock(block: YamlMap, parentRole?: CellRole): BlockConfig[] {
  const sourceType = normalizeSourceType(textValue(block.type) || "text");
  const title = textValue(block.title);
  const subtitle = textValue(block.subtitle);
  const description = textValue(block.description);
  const emoji = textValue(block.emoji ?? block.titleEmoji ?? block.icon);
  const content = textValue(block.content) || textValue(block.text);
  const codeContent = textValue(block.content) || textValue(block.code);
  const displayTitle = decoratedTitle(emoji, title);
  const roleFromParent = parentRole === "exercise" ? "exercise" : undefined;

  if (["mainHeader", "sectionHeader", "sectionTitle"].includes(sourceType)) {
    return [markdownBlock({
      content: [displayTitle ? `## ${displayTitle}` : "", subtitle].filter(Boolean).join("\n\n"),
      displayKind: "title",
      payload: { ...block, title: displayTitle || title, subtitle, emoji },
      role: "title",
      sourceType,
      title: displayTitle || title || subtitle,
    })];
  }

  if (["hero", "localRunner", "tiobeIndex"].includes(sourceType)) {
    const localTitle = sourceType === "localRunner" ? title || "Codaro 실행 셀" : title;
    const localDisplayTitle = sourceType === "localRunner" ? localTitle : displayTitle;
    const localDescription = sourceType === "localRunner"
      ? description || "옆의 Python 셀을 Codaro 로컬 커널로 실행합니다."
      : description;
    return [markdownBlock({
      content: [localDisplayTitle ? `## ${localDisplayTitle}` : "", subtitle, localDescription, pointLines(block.points)].filter(Boolean).join("\n\n"),
      displayKind: "hero",
      payload: { ...block, type: sourceType, title: localDisplayTitle || localTitle || title, subtitle, description: localDescription, points: arrayOfMaps(block.points) },
      role: "visual",
      sourceType,
      title: localDisplayTitle || localTitle || title || subtitle || sourceType,
    })];
  }

  if (["featureCards", "choiceCards", "resourceCards", "threeColumnCards"].includes(sourceType)) {
    const cards = arrayOfMaps(block.cards ?? block.items ?? block.resources);
    return [markdownBlock({
      content: formatCardList(cards, title || blockTypeLabel(sourceType)),
      displayKind: sourceType === "resourceCards" ? "resource" : "cardGrid",
      payload: { ...block, title: title || blockTypeLabel(sourceType), subtitle, cards, links: cards },
      role: sourceType === "resourceCards" ? "explanation" : "visual",
      sourceType,
      title: title || blockTypeLabel(sourceType),
    })];
  }

  if (["compare", "fullWidthComparison"].includes(sourceType)) {
    const cards = arrayOfMaps(block.cards);
    if (cards.length) {
      return [markdownBlock({
        content: formatCardList(cards, title || "비교"),
        displayKind: "comparison",
        payload: { ...block, title: title || "비교", subtitle, cards },
        role: "visual",
        sourceType,
        title: title || "비교",
      })];
    }
    const left = comparisonSide(block, "left");
    const right = comparisonSide(block, "right");
    return [markdownBlock({
      content: formatCompare(left, right, title || "비교"),
      displayKind: "comparison",
      payload: { title: title || "비교", subtitle, left, right },
      role: "visual",
      sourceType,
      title: [textValue(left.title), textValue(right.title)].filter(Boolean).join(" vs ") || title || "비교",
    })];
  }

  if (sourceType === "table") {
    const rows = arrayOfMaps(block.rows ?? block.items ?? block.data);
    return [markdownBlock({
      content: formatTable(rows, title || "표"),
      displayKind: "table",
      payload: { title: title || "표", subtitle, rows },
      role: "visual",
      sourceType,
      title: title || "표",
    })];
  }

  if (["image", "video", "youtube", "videoCarousel", "pdf", "MIME"].includes(sourceType)) {
    const src = textValue(block.src ?? block.url ?? block.href ?? block.imageUrl ?? block.videoUrl ?? block.buttonLink ?? block.youtubeId);
    const items = arrayOfMaps(block.items ?? block.videos);
    return [markdownBlock({
      content: formatMedia({ sourceType, src, title, subtitle, description, items }),
      displayKind: "media",
      payload: { ...block, sourceType, src, title, subtitle, description, items },
      role: "visual",
      sourceType,
      title: title || subtitle || blockTypeLabel(sourceType),
    })];
  }

  if (["link", "links", "linkButtons"].includes(sourceType)) {
    const links = sourceType === "link"
      ? [{ title: title || textValue(block.text ?? block.label) || textValue(block.url), url: textValue(block.url ?? block.href ?? block.buttonLink), description }]
      : arrayOfMaps(block.items ?? block.links ?? block.buttons);
    return [markdownBlock({
      content: formatLinks(links, title || "참고 자료"),
      displayKind: "resource",
      payload: { title: title || "참고 자료", links },
      role: "explanation",
      sourceType,
      title: title || "참고 자료",
    })];
  }

  if (["tip", "tipCard", "note", "info", "warning", "codeDescription"].includes(sourceType)) {
    const calloutTitle = title || blockTypeLabel(sourceType);
    return [markdownBlock({
      content: [`### ${calloutTitle}`, content || description || subtitle].filter(Boolean).join("\n\n"),
      description,
      displayKind: "callout",
      payload: { tone: sourceType, title: calloutTitle, content: content || description || subtitle },
      role: sourceType === "warning" ? "check" : "explanation",
      sourceType,
      title: calloutTitle,
    })];
  }

  if (sourceType === "quiz") {
    const question = textValue(block.question) || title || "문제";
    const options = arrayOfText(block.options ?? block.choices);
    return [markdownBlock({
      content: [`### 문제`, question, ...options.map((option, index) => `${index + 1}. ${option}`)].join("\n\n"),
      displayKind: "quiz",
      payload: { question, options, answer: block.answer ?? block.correctAnswer },
      role: "check",
      sourceType,
      title: question,
    })];
  }

  if (["practiceCard", "stepCard"].includes(sourceType)) {
    return [markdownBlock({
      content: [`### ${title || blockTypeLabel(sourceType)}`, subtitle, description, content, pointLines(block.items ?? block.steps ?? block.tips), footerText(block.footer)].filter(Boolean).join("\n\n"),
      displayKind: "practice",
      payload: {
        ...block,
        title: displayTitle || title,
        subtitle,
        description,
        content,
        items: arrayOfMaps(block.items ?? block.steps ?? block.tips),
        tips: arrayOfText(block.tips),
        footer: mapValue(block.footer),
      },
      role: "exercise",
      sourceType,
      title: displayTitle || title || blockTypeLabel(sourceType),
    })];
  }

  if (sourceType === "expansion") {
    const cells: BlockConfig[] = [markdownBlock({
      content: [`### ${title || "실습"}`, subtitle, description, content].filter(Boolean).join("\n\n"),
      displayKind: "practice",
      payload: { ...block, title: displayTitle || title || "실습", subtitle, description, content },
      role: "exercise",
      sourceType,
      title: displayTitle || title || "실습",
    })];
    for (const nested of arrayOfMaps(block.blocks)) {
      cells.push(...convertYamlBlock(nested, "exercise"));
    }
    const solution = localizeCode(textValue(block.code));
    if (solution.length || !arrayOfMaps(block.blocks).length) {
      cells.push(codeBlock({
        content: "",
        description: description || content || title,
        executionKind: "python",
        guide: {
          checkConfig: {},
          description: description || content || title || "실습 코드를 작성하고 실행하세요.",
          difficulty: expansionDifficulty(title),
          exerciseType: "curriculum-expansion",
          hints: expansionHints(title, description || content),
          solution,
          studentAnswer: "",
        },
        role: "exercise",
        sourceType,
        title: displayTitle || title || "실습",
      }));
    }
    return cells;
  }

  if (sourceType === "code") {
    const localizedCode = localizeCode(codeContent);
    return [codeBlock({
      content: localizedCode,
      description,
      executionKind: executionKindFromLanguage(textValue(block.language)),
      role: roleFromParent ?? "snippet",
      sourceType,
      title: title || firstCodeLine(localizedCode),
    })];
  }

  if (sourceType === "list") {
    const items = arrayOfText(block.items);
    return [markdownBlock({
      content: items.map((item) => `- ${item}`).join("\n"),
      displayKind: "prose",
      payload: { title, items },
      role: roleFromParent ?? "learning",
      sourceType,
      title: title || "목록",
    })];
  }

  if (sourceType === "centerText") {
    const endEmoji = textValue(block.endEmoji);
    return [markdownBlock({
      content: [displayTitle ? `## ${displayTitle}` : "", subtitle, description, content, endEmoji].filter(Boolean).join("\n\n"),
      displayKind: "centerText",
      payload: { ...block, title: displayTitle || title, subtitle, description, content, endEmoji },
      role: "learning",
      sourceType,
      title: displayTitle || title || firstSentence(content || description || subtitle),
    })];
  }

  return [markdownBlock({
    content: [displayTitle ? `### ${displayTitle}` : "", subtitle, description, content || textFromUnknownBlock(block)].filter(Boolean).join("\n\n"),
    displayKind: "prose",
    payload: { ...block, title: displayTitle || title, subtitle, description, content },
    role: roleFromParent ?? "learning",
    sourceType,
    title: displayTitle || title || firstSentence(content || description || subtitle || sourceType),
  })];
}

function parseYaml(raw: string): YamlMap {
  const parsed = parse(raw);
  return mapValue(parsed);
}

function lessonTitle(yaml: YamlMap) {
  return textValue(mapValue(yaml.meta).title ?? yaml.title);
}

function lessonTitleFromRaw(raw: string) {
  const lines = raw.split(/\r?\n/).slice(0, 80);
  let inMeta = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const indent = line.length - line.trimStart().length;
    if (indent === 0 && /^meta\s*:/.test(trimmed)) {
      inMeta = true;
      continue;
    }
    if (inMeta && indent === 0) {
      inMeta = false;
    }

    if (trimmed.startsWith("title:") && (inMeta || indent === 0)) {
      return cleanYamlTitle(trimmed.slice("title:".length));
    }
  }

  return "";
}

function cleanYamlTitle(value: string) {
  const trimmed = value.trim();
  if (!trimmed || trimmed === "|" || trimmed === ">") return "";
  if ((trimmed.startsWith("\"") && trimmed.endsWith("\"")) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed.replace(/\s+#.*$/, "").trim();
}

function introMarkdown(title: string, intro: YamlMap) {
  const goal = textValue(intro.goal);
  const description = textValue(intro.description);
  const points = arrayOfText(intro.points);
  return [`# ${title}`, goal, description, points.map((point) => `- ${point}`).join("\n")].filter(Boolean).join("\n\n");
}

function markdownBlock({
  content,
  description,
  displayKind = "prose",
  payload,
  role = "explanation",
  sourceType,
  title,
}: {
  content: string;
  description?: string;
  displayKind?: CellDisplayKind;
  payload?: unknown;
  role?: CellRole;
  sourceType?: string;
  title?: string;
}): BlockConfig {
  return {
    id: `md-${hashContent(`${role}:${displayKind}:${title ?? ""}:${content}`)}`,
    type: "markdown",
    content,
    description,
    displayKind,
    payload,
    role,
    sourceType,
    title,
  };
}

function codeBlock({
  content,
  description,
  executionKind = "python",
  guide,
  role = "snippet",
  sourceType,
  title,
}: {
  content: string;
  description?: string;
  executionKind?: ExecutionKind;
  guide?: BlockConfig["guide"];
  role?: CellRole;
  sourceType?: string;
  title?: string;
}): BlockConfig {
  return {
    id: `py-${hashContent(`${role}:${executionKind}:${title ?? ""}:${content}`)}`,
    type: "code",
    content,
    description,
    displayKind: "code",
    executionKind,
    role,
    sourceType,
    title,
    guide,
  };
}

function formatCardList(cards: YamlMap[], fallbackTitle: string) {
  if (!cards.length) return `### ${fallbackTitle}`;
  return [
    `### ${fallbackTitle}`,
    ...cards.map((card) => {
      const heading = [textValue(card.emoji), textValue(card.title)].filter(Boolean).join(" ");
      return [`#### ${heading || "카드"}`, textValue(card.description ?? card.content)].filter(Boolean).join("\n");
    }),
  ].join("\n\n");
}

function formatCompare(left: YamlMap, right: YamlMap, fallbackTitle: string) {
  const formatSide = (label: string, side: YamlMap) => [
    `#### ${[textValue(side.icon), textValue(side.title) || label].filter(Boolean).join(" ")}`,
    textValue(side.subtitle),
    arrayOfText(side.items).map((item) => `- ${item}`).join("\n"),
    textValue(side.infoBox) ? `> ${textValue(side.infoBox)}` : "",
  ].filter(Boolean).join("\n");

  return [`### ${fallbackTitle}`, formatSide("왼쪽", left), formatSide("오른쪽", right)].join("\n\n");
}

function comparisonSide(block: YamlMap, side: "left" | "right") {
  const nested = mapValue(block[side]);
  if (Object.keys(nested).length) return nested;

  const titleKey = `${side}Title`;
  const iconKey = `${side}Icon`;
  const itemsKey = `${side}Items`;
  const infoKey = `${side}InfoBox`;
  const subtitleKey = `${side}Subtitle`;

  return {
    title: textValue(block[titleKey]),
    icon: textValue(block[iconKey]),
    subtitle: textValue(block[subtitleKey]),
    items: arrayOfText(block[itemsKey]),
    infoBox: textValue(block[infoKey]),
  };
}

function formatTable(rows: YamlMap[], fallbackTitle: string) {
  if (!rows.length) return `### ${fallbackTitle}`;
  const columns = Array.from(rows.reduce((keys, row) => {
    Object.keys(row).forEach((key) => keys.add(key));
    return keys;
  }, new Set<string>()));
  return [
    `### ${fallbackTitle}`,
    `| ${columns.join(" | ")} |`,
    `| ${columns.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${columns.map((column) => textValue(row[column])).join(" | ")} |`),
  ].join("\n");
}

function formatLinks(links: YamlMap[], fallbackTitle: string) {
  if (!links.length) return `### ${fallbackTitle}`;
  return [
    `### ${fallbackTitle}`,
    ...links.map((link) => {
      const title = textValue(link.title ?? link.text ?? link.label ?? link.name ?? link.url ?? link.href) || "링크";
      const url = textValue(link.url ?? link.href ?? link.buttonLink) || "#";
      const description = textValue(link.description);
      return `- [${title}](${url})${description ? ` - ${description}` : ""}`;
    }),
  ].join("\n");
}

function formatMedia({
  sourceType,
  src,
  title,
  subtitle,
  description,
  items,
}: {
  sourceType: string;
  src: string;
  title: string;
  subtitle: string;
  description: string;
  items: YamlMap[];
}) {
  if (sourceType === "image" && src) return `![${title || subtitle || "이미지"}](${src})`;
  const itemLines = items.map((item) => {
    const label = textValue(item.title ?? item.label ?? item.url ?? item.src) || "자료";
    const url = textValue(item.url ?? item.src ?? item.href);
    return url ? `- [${label}](${url})` : `- ${label}`;
  });
  return [`### ${title || blockTypeLabel(sourceType)}`, subtitle, description, src ? `[자료 열기](${src})` : "", itemLines.join("\n")].filter(Boolean).join("\n\n");
}

function pointLines(value: unknown) {
  const objects = arrayOfMaps(value);
  if (objects.length) {
    return objects.map((point) => `- ${[textValue(point.emoji), textValue(point.title ?? point.label), textValue(point.description)].filter(Boolean).join(" ")}`).join("\n");
  }
  return arrayOfText(value).map((item) => `- ${item}`).join("\n");
}

function textFromUnknownBlock(block: YamlMap): string {
  return Object.entries(block)
    .filter(([key]) => !["type", "style"].includes(key))
    .map(([key, value]): string => {
      if (Array.isArray(value)) return `**${key}**\n${arrayOfText(value).map((item) => `- ${item}`).join("\n")}`;
      if (isMap(value)) return `**${key}**\n${textFromUnknownBlock(value)}`;
      return `**${key}** ${textValue(value)}`;
    })
    .filter(Boolean)
    .join("\n\n");
}

function footerText(value: unknown) {
  const footer = mapValue(value);
  return [textValue(footer.icon), textValue(footer.text ?? footer.title ?? footer.description)].filter(Boolean).join(" ");
}

function expansionDifficulty(title: string) {
  if (/심화|도전|고급|응용/.test(title)) return "hard";
  if (/중급|복습|연습/.test(title)) return "medium";
  return "easy";
}

function expansionHints(title: string, description: string) {
  return [
    description,
    title ? `${title.replace(/^[^\w가-힣]+/, "")}에서 요구하는 출력이나 값을 먼저 한 줄로 정리하세요.` : "",
    "실행 결과가 예상과 다르면 print()로 중간 값을 확인하세요.",
  ].filter(Boolean);
}

function localizeCode(value: string) {
  if (!value) return "";
  const localized = value
    .replaceAll("from pyodide.http import open_url", "from urllib.request import urlopen")
    .replaceAll("open_url(", "urlopen(")
    .replace(/\bmo\.iframe\(([A-Za-z_][A-Za-z0-9_]*)\._repr_html_\(\)\)/g, "$1");
  const lines = localized.split("\n").filter((line) => {
    const stripped = line.trim();
    if (["import marimo as mo", "import marimo", "import micropip", "import pyodide_http", "pyodide_http.patch_all()"].includes(stripped)) return false;
    if (stripped.startsWith("await micropip.install(")) return false;
    return true;
  });
  const result = lines.join("\n").replace(/^\n+|\n+$/g, "");
  return result.trim() ? result : "pass";
}

function executionKindFromLanguage(language: string): ExecutionKind {
  const normalized = language.toLowerCase();
  if (normalized.includes("browser")) return "browser";
  if (normalized.includes("shell") || normalized.includes("powershell") || normalized.includes("os")) return "os";
  if (normalized.includes("mouse")) return "mouse";
  if (normalized.includes("image")) return "image";
  if (normalized.includes("task")) return "task";
  if (normalized.includes("skill")) return "skill";
  return "python";
}

function normalizeSourceType(value: string) {
  const normalized = value.trim().replace(/^['"]|['"]$/g, "");
  if (normalized === "marimoIDE") return "localRunner";
  return normalized;
}

function blockTypeLabel(type: string) {
  const normalized = type.trim();
  const labels: Record<string, string> = {
    centerText: "중앙 설명",
    choiceCards: "선택 카드",
    codeDescription: "코드 설명",
    featureCards: "핵심 카드",
    fullWidthComparison: "비교",
    hero: "대표 설명",
    image: "이미지",
    info: "정보",
    link: "링크",
    linkButtons: "링크",
    links: "참고 자료",
    localRunner: "Codaro 실행 셀",
    MIME: "미디어",
    note: "노트",
    pdf: "PDF",
    practiceCard: "실습",
    quiz: "문제",
    resourceCards: "참고 자료",
    stepCard: "단계",
    table: "표",
    threeColumnCards: "카드",
    tiobeIndex: "순위",
    tip: "팁",
    tipCard: "팁",
    video: "영상",
    videoCarousel: "영상",
    warning: "주의",
    youtube: "YouTube",
  };
  return labels[normalized] ?? labels[normalized.toLowerCase()] ?? normalized.replace(/([a-z])([A-Z])/g, "$1 $2");
}

function mapValue(value: unknown): YamlMap {
  return isMap(value) ? value : {};
}

function arrayOfMaps(value: unknown): YamlMap[] {
  return Array.isArray(value) ? value.map(mapValue).filter((item) => Object.keys(item).length) : [];
}

function arrayOfText(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => {
    if (typeof item === "string" || typeof item === "number" || typeof item === "boolean") return String(item);
    if (isMap(item)) return [textValue(item.emoji), textValue(item.title ?? item.label ?? item.name), textValue(item.description ?? item.content)].filter(Boolean).join(" ");
    return "";
  }).filter(Boolean);
}

function textValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return "";
}

function isMap(value: unknown): value is YamlMap {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function ensureUniqueBlockIds(blocks: BlockConfig[]) {
  const seen = new Map<string, number>();
  return blocks.map((block) => {
    const count = seen.get(block.id) ?? 0;
    seen.set(block.id, count + 1);
    return count ? { ...block, id: `${block.id}-${count + 1}` } : block;
  });
}

function hashContent(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash.toString(36);
}

function titleFromFileName(value: string) {
  return value.replace(/^\d+[_-]?/, "").replace(/^day\d+[_-]?/i, "").replace(/_/g, " ");
}

function firstSentence(value: string) {
  return value.replace(/\s+/g, " ").split(/[.!?。]/)[0]?.slice(0, 80) || "설명";
}

function firstCodeLine(value: string) {
  return value.split("\n").find((line) => line.trim() && !line.trim().startsWith("#"))?.trim().slice(0, 80) || "Python 셀";
}

function decoratedTitle(emoji: string, title: string) {
  if (!emoji) return title;
  if (!title) return emoji;
  if (title.startsWith(emoji)) return title;
  return `${emoji} ${title}`;
}

function categoryTitleFromRegistry(key: string) {
  return categoryLabels[key]?.title ?? key.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^\w/, (value) => value.toUpperCase());
}
