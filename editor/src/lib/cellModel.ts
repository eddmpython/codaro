import type { BlockConfig } from "@/types";

export type LearningCellKind = "concept" | "visual" | "snippet" | "practice" | "check" | "reflection" | "automation";
export type CellAiAction = "explain" | "hint" | "check" | "revise";

export function classifyLearningCell(block: BlockConfig, draft: string): LearningCellKind {
  if (block.type === "automation") return "automation";
  if (block.displayKind === "quiz") return "check";
  if (block.displayKind === "practice") return "practice";
  if (block.displayKind === "hero" || block.displayKind === "cardGrid" || block.displayKind === "comparison" || block.displayKind === "table" || block.displayKind === "media") return "visual";
  if (block.displayKind === "resource" || block.displayKind === "callout" || block.displayKind === "centerText") return "concept";
  if (block.role === "title") return "visual";
  if (block.role === "learning" || block.role === "explanation") return "concept";
  if (block.role === "snippet") return "snippet";
  if (block.role === "exercise") return "practice";
  if (block.role === "check") return "check";
  if (block.role === "visual") return "visual";
  if (block.role === "automation" || block.executionKind === "browser" || block.executionKind === "os" || block.executionKind === "mouse") return "automation";
  if (block.role === "skill" || block.executionKind === "skill") return "automation";

  const content = (block.type === "code" ? draft : block.content).toLowerCase();
  const lineCount = (block.type === "code" ? draft : block.content).split("\n").filter((line) => line.trim()).length;

  if (block.type === "markdown") {
    if (/\|.+\||compare|diagram|visual|표|비교|그림|흐름|구조/.test(content)) return "visual";
    if (/mission|practice|exercise|실습|미션|연습|문제/.test(content)) return "practice";
    if (/check|expected|assert|검증|확인|테스트|정답/.test(content)) return "check";
    if (/recap|summary|conclusion|next|결론|요약|정리|다음/.test(content)) return "reflection";
    return "concept";
  }

  if (block.guide || /todo|your code|fill|빈칸|작성|바꿔|수정/.test(content)) return "practice";
  if (/assert|pytest|expected|check|검증|정답|테스트/.test(content)) return "check";
  if (/schedule|task|workflow|automation|webhook|자동화/.test(content)) return "automation";
  if (lineCount <= 8) return "snippet";
  return "practice";
}

export function buildCellAiPrompt(action: CellAiAction, block: BlockConfig) {
  const label = blockLabel(block);
  const typeLabel = block.type === "code" ? "코드 셀" : "학습 셀";
  const preview = block.content.length > 900 ? `${block.content.slice(0, 900)}...` : block.content;
  const base = `선택한 ${typeLabel}: ${label}\n\n셀 내용:\n${preview}`;

  if (action === "hint") {
    return `${base}\n\n이미 풀린 셀이 아니라면 전체 정답을 바로 공개하지 말고, 이 셀을 풀 수 있는 실용적인 힌트를 줘.`;
  }

  if (action === "check") {
    return `${base}\n\n학습자 답과 현재 출력이 맞는지 확인해줘. 틀렸다면 셀을 수정하기 전에 가장 작은 다음 수정부터 설명해줘.`;
  }

  if (action === "revise") {
    return `${base}\n\n명확성과 학습 가치를 높이도록 이 셀을 수정해줘. 먼저 변경안을 제안하고, 확실히 유익할 때만 write-cell을 사용해줘.`;
  }

  return `${base}\n\n이 셀을 맥락 안에서 설명해줘. 학습자가 이해해야 할 것, 다음에 실행하거나 수정할 것, 답을 검증하는 방법을 포함해줘.`;
}

export function cellRoleLabel(role?: BlockConfig["role"]) {
  if (role === "title") return "타이틀";
  if (role === "learning") return "학습";
  if (role === "snippet") return "스니펫";
  if (role === "exercise") return "실습";
  if (role === "check") return "검증";
  if (role === "visual") return "시각화";
  if (role === "automation") return "자동화";
  if (role === "skill") return "스킬";
  return "설명";
}

export function executionKindLabel(kind?: BlockConfig["executionKind"]) {
  if (kind === "browser") return "브라우저";
  if (kind === "os") return "OS";
  if (kind === "mouse") return "마우스";
  if (kind === "image") return "이미지";
  if (kind === "task") return "태스크";
  if (kind === "skill") return "스킬";
  return "Python";
}

export function blockLabel(block: BlockConfig) {
  const genericTitles = new Set(["List", "목록", "Text", "Concept", "Learning", "Practice", "실습", "Python cell"]);
  if (block.title && !genericTitles.has(block.title)) return stripMarkdown(block.title);
  if (block.sourceType === "list") {
    const firstItem = block.content.split("\n").find((line) => line.trim());
    if (firstItem) return stripMarkdown(stripBullet(firstItem));
  }
  if (block.type === "markdown") {
    return stripMarkdown(block.content.split("\n").find((line) => line.trim()) ?? "마크다운");
  }
  const firstLine = block.content.split("\n").find((line) => line.trim());
  return firstLine ? firstLine.slice(0, 80) : "빈 코드 셀";
}

export function stripBullet(line: string) {
  return line.replace(/^[-*]\s+/, "").replace(/^\d+\.\s+/, "").trim();
}

export function stripMarkdown(line: string) {
  return line.replace(/[#>*_`[\]()]/g, "").replace(/\s+/g, " ").trim();
}
