import { getActiveLocale } from "@/lib/localeCopy";

export type TeacherScope = "cell" | "lesson" | "curriculum" | "automation";

export function teacherScopeLabel(scope: TeacherScope) {
  const en = getActiveLocale() === "en";
  if (scope === "lesson") return en ? "lesson" : "레슨";
  if (scope === "curriculum") return en ? "curriculum" : "커리큘럼";
  if (scope === "automation") return en ? "automation" : "자동화";
  return en ? "cell" : "셀";
}

export function inferTeacherScope(message: string, fallback: TeacherScope): TeacherScope {
  const normalized = message.toLowerCase();
  if (/커리큘럼|학습\s*경로|전체\s*과정|로드맵|curriculum/.test(normalized)) return "curriculum";
  if (/레슨|강의|수업|lesson/.test(normalized)) return "lesson";
  if (/배우|학습|공부|연습|실습|learn|study|practice/.test(normalized)) return "curriculum";
  if (/자동화|루틴|태스크|반복\s*업무|업무\s*자동화|워크플로|예약|레시피|automation|automate|routine|task|workflow|schedule|recipe/.test(normalized)) return "automation";
  if (/셀|코드|답|출력|에러|오류|cell|answer|output|error/.test(normalized)) return "cell";
  if (/아무거나|해보자|시작|처음/.test(normalized)) return "curriculum";
  return fallback;
}
