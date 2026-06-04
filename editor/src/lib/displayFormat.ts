export function statusLabel(status?: string | null) {
  if (!status) return "없음";
  const normalized = status.toLowerCase();
  if (normalized === "success") return "성공";
  if (normalized === "error") return "오류";
  if (normalized === "running") return "실행 중";
  if (normalized === "package-error") return "준비 실패";
  if (normalized === "idle") return "대기";
  if (normalized === "stale") return "오래됨";
  if (normalized === "conflict") return "충돌";
  if (normalized === "stopped") return "중단";
  if (normalized === "done") return "완료";
  if (normalized === "pending") return "대기 중";
  if (normalized === "failed") return "실패";
  if (normalized === "paused") return "일시정지";
  if (normalized === "ready") return "준비됨";
  if (normalized === "offline") return "오프라인";
  if (normalized === "available") return "사용 가능";
  return status;
}

export function stringifyData(data: unknown) {
  if (data === undefined || data === null || data === "") return "";
  if (typeof data === "string") return data;
  try {
    return JSON.stringify(data, null, 2);
  } catch {
    return String(data);
  }
}

export function shortPath(path: string) {
  const normalized = path.replaceAll("\\", "/");
  const parts = normalized.split("/");
  if (parts.length <= 2) return normalized;
  return `${parts.at(-2)}/${parts.at(-1)}`;
}

export function difficultyLabel(value: string) {
  if (value === "easy") return "쉬움";
  if (value === "medium") return "보통";
  if (value === "hard") return "어려움";
  return value;
}
