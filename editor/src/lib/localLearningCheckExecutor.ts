import { CodaroApiError, codaroApi } from "@/lib/api";
import type { StrongLearningCheckSpecV1 } from "@/lib/learningCheckSpec";

const LOCAL_CHECK_TRANSPORT_ATTEMPTS = 2;
const LOCAL_CHECK_TRANSPORT_GRACE_MS = 5_000;

export async function executeLocalStrongCheck(
  spec: StrongLearningCheckSpecV1,
  source: string,
) {
  try {
    return await requestLocalStrongCheck(spec, source);
  } catch (error) {
    return {
      actual: "",
      detail: error instanceof Error
        ? `로컬 격리 검증을 마치지 못했습니다: ${error.message}`
        : "로컬 격리 검증을 마치지 못했습니다.",
      executor: "local-sandbox" as const,
      expected: "",
      passed: false,
      state: "error" as const,
    };
  }
}

async function requestLocalStrongCheck(
  spec: StrongLearningCheckSpecV1,
  source: string,
) {
  let lastError: unknown = new Error("로컬 격리 검증 요청을 시작하지 못했습니다.");
  for (let attempt = 0; attempt < LOCAL_CHECK_TRANSPORT_ATTEMPTS; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(
      () => controller.abort(),
      spec.timeoutMs * 2 + LOCAL_CHECK_TRANSPORT_GRACE_MS,
    );
    try {
      return await codaroApi.localStrongCheck(
        spec as unknown as Record<string, unknown>,
        source,
        controller.signal,
      );
    } catch (error) {
      lastError = error;
      if (!isRetryableTransportError(error) || attempt === LOCAL_CHECK_TRANSPORT_ATTEMPTS - 1) {
        throw error;
      }
    } finally {
      window.clearTimeout(timeoutId);
    }
  }
  throw lastError;
}

function isRetryableTransportError(error: unknown): boolean {
  if (error instanceof CodaroApiError) return error.status >= 500;
  return error instanceof TypeError || (error instanceof Error && error.name === "AbortError");
}
