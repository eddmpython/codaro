import { useEffect, useRef } from "react";
import type { BlockConfig, ExecutionResult } from "@/types";

/**
 * 레슨을 열면 완성 예제를 순서대로 자동 실행한다.
 *
 * 예제는 코드만 보여 주고 결과는 감춰 두던 자리였다. 차트를 만드는 예제조차 학습자 화면에는
 * 글자만 남아, 그 절이 무엇을 만드는지 눈으로 볼 방법이 없었다. 예제가 만드는 결과는 시스템이
 * 이미 아는 내용이라 학습자가 따로 눌러 확인할 이유가 없다.
 *
 * 큐를 한 번에 하나씩 보내는 이유는 두 가지다. 커널 세션이 하나라 동시에 보내면 서로의 순서를
 * 밀어내고, 앞 예제가 만든 변수를 뒤 예제가 그대로 쓰기 때문에 순서가 곧 정확성이다.
 *
 * 같은 이유로 학습자가 직접 실행을 시작하면 남은 큐를 버린다. 커널이 하나뿐이라 자동 실행이
 * 뒤에서 계속 셀을 보내면 학습자가 방금 누른 실행과 자리를 다투고, 학습자가 만들지 않은 결과가
 * 그의 연습 결과인 것처럼 화면에 남는다. 학습자의 실행이 언제나 우선이다.
 *
 * 별도 패키지를 요구하는 레슨은 아예 자동 실행하지 않는다. 그런 예제는 브라우저 커널에서
 * 반드시 실패하고, 그 실패가 커널 상태에 남아 학습자가 이어서 실행한 연습의 판정까지
 * 오류로 뒤집는다. 미지원이라고 알려 줘야 할 자리에 학습자 잘못처럼 보이는 오류가 뜬다.
 */
export function useSnippetAutoRun({
  blocks,
  canRun,
  lessonKey,
  onRunBlock,
  requiresPackages,
  results,
  runningBlockId,
}: {
  blocks: BlockConfig[];
  canRun: boolean;
  lessonKey: string;
  onRunBlock: (block: BlockConfig, source: string) => void;
  /** 레슨이 별도 패키지를 요구하는가. 브라우저 커널에서는 그 예제가 반드시 실패한다. */
  requiresPackages: boolean;
  results: Record<string, ExecutionResult>;
  runningBlockId: string | null;
}): void {
  const queueRef = useRef<string[]>([]);
  const lessonRef = useRef("");
  const pendingRef = useRef<string | null>(null);

  useEffect(() => {
    if (lessonRef.current === lessonKey) return;
    lessonRef.current = lessonKey;
    pendingRef.current = null;
    queueRef.current = blocks
      .filter((block) => block.type === "code" && block.role === "snippet" && block.content.trim())
      .map((block) => block.id);
  }, [blocks, lessonKey]);

  useEffect(() => {
    if (!canRun || requiresPackages) return;
    if (runningBlockId) {
      // 우리가 보낸 셀이 아니면 학습자가 직접 실행한 것이다. 남은 예제는 보내지 않는다.
      if (runningBlockId !== pendingRef.current) queueRef.current = [];
      return;
    }
    const pending = pendingRef.current;
    if (pending && !results[pending]) return;
    pendingRef.current = null;
    const queue = queueRef.current;
    while (queue.length) {
      const nextId = queue.shift();
      if (!nextId || results[nextId]) continue;
      const block = blocks.find((item) => item.id === nextId);
      if (!block) continue;
      pendingRef.current = block.id;
      onRunBlock(block, block.content);
      return;
    }
  }, [blocks, canRun, onRunBlock, results, runningBlockId]);
}
