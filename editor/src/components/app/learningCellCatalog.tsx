import {
  CheckCircle2,
  Circle,
  GraduationCap,
  Play,
  Sparkles,
  TerminalSquare,
  Workflow,
} from "lucide-react";
import type { ComponentType } from "react";

import type { LearningCellKind } from "@/lib/cellModel";

export const learningCellCatalog: Record<LearningCellKind, {
  label: string;
  description: string;
  Icon: ComponentType<{ className?: string }>;
}> = {
  concept: {
    label: "개념",
    description: "코드를 쓰기 전에 보는 짧은 설명입니다.",
    Icon: GraduationCap,
  },
  visual: {
    label: "시각 자료",
    description: "표, 비교, 다이어그램, 기억 장치입니다.",
    Icon: Sparkles,
  },
  snippet: {
    label: "스니펫",
    description: "복사해서 바꿔 볼 수 있는 재사용 코드 패턴입니다.",
    Icon: TerminalSquare,
  },
  practice: {
    label: "실습",
    description: "학습자가 실행하고 고쳐 보는 편집 가능한 셀입니다.",
    Icon: Play,
  },
  check: {
    label: "검증",
    description: "정답 확인, 예상 출력, 셀프 테스트 셀입니다.",
    Icon: CheckCircle2,
  },
  reflection: {
    label: "정리",
    description: "요약, 결론, 다음 단계 안내입니다.",
    Icon: Circle,
  },
  automation: {
    label: "자동화",
    description: "태스크, 워크플로, 예약 실행 셀입니다.",
    Icon: Workflow,
  },
};
