// "프로바이더 미연결" 소프트 초대를 X 로 영구히 닫는 사용자 선택을 보관한다.
// 프로바이더 없이 쓰려는 사람이 매 세션 다시 안내받지 않도록 localStorage 에 남긴다.
// (실제 끊김 알림은 에피소드 단위로만 닫히므로 여기서 다루지 않는다.)

export const providerPromptDismissedKey = "codaro-provider-prompt-dismissed";

export function loadProviderPromptDismissed(): boolean {
  try {
    return window.localStorage.getItem(providerPromptDismissedKey) === "true";
  } catch {
    // localStorage 접근 불가(프라이빗 모드 등)면 닫지 않은 것으로 본다.
    return false;
  }
}

export function saveProviderPromptDismissed(value: boolean): void {
  try {
    if (value) {
      window.localStorage.setItem(providerPromptDismissedKey, "true");
    } else {
      window.localStorage.removeItem(providerPromptDismissedKey);
    }
  } catch {
    // 저장 실패 시 무시 — 닫기 상태는 이번 세션 한정으로만 동작한다.
  }
}
