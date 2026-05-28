import { useEffect, useState } from "react";
import { Sparkles, AlertCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { codaroApi } from "@/lib/api";
import type { CheckProposalsPayload } from "@/types";

/**
 * 작가 모드 (DEV) — lesson 의 약한 검증 셀을 LLM 이 보강 제안하는 패널.
 * import.meta.env.DEV 가드 — 빌드 산출물에는 노출되지 않는다.
 */
export function CheckProposalsPanel() {
  const [data, setData] = useState<CheckProposalsPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!expanded) return;
    setLoading(true);
    setError(null);
    codaroApi
      .curriculumCheckProposals()
      .then((next) => setData(next))
      .catch((err) => setError(err instanceof Error ? err.message : String(err)))
      .finally(() => setLoading(false));
  }, [expanded]);

  if (!import.meta.env.DEV) return null;

  return (
    <div className="mt-3 rounded-md border border-amber-700/40 bg-amber-950/20 px-3 py-2 text-[11px] text-amber-200">
      <button
        type="button"
        className="flex items-center gap-1.5 font-medium hover:text-amber-100"
        onClick={() => setExpanded((s) => !s)}
      >
        <Sparkles className="h-3 w-3" />
        <span>작가 모드: 검증 약점 + 제안</span>
        <span className="text-amber-400/70">{expanded ? "▴" : "▾"}</span>
      </button>
      {expanded && (
        <div className="mt-2 space-y-2">
          {loading && <div className="text-amber-300/70">불러오는 중…</div>}
          {error && (
            <div className="flex items-center gap-1 text-red-300">
              <AlertCircle className="h-3 w-3" /> {error}
            </div>
          )}
          {data && (
            <>
              <div className="text-amber-300/70">
                약점 {data.weak.length}개 · 제안 {data.proposals.length}개 ·
                AI {data.available ? "활성" : "비활성 (제안 불가)"}
              </div>
              {data.weak.slice(0, 10).map((w) => (
                <div
                  key={`${w.lessonKey}/${w.sectionId}/${w.outcomeId}`}
                  className="rounded border border-amber-700/30 bg-amber-950/30 px-2 py-1.5"
                >
                  <div className="flex items-center gap-1">
                    <span className="font-mono text-amber-100">{w.lessonKey}</span>
                    <span className="text-amber-400/70">§{w.sectionId}</span>
                    <Badge
                      variant="outline"
                      className="h-3.5 border-amber-700/40 px-1 text-[9px] text-amber-300"
                    >
                      {w.outcomeLabel}
                    </Badge>
                  </div>
                  <div className="mt-0.5 text-[10px] text-amber-300/70">{w.reason}</div>
                </div>
              ))}
              {data.proposals.length > 0 && (
                <div className="mt-2 space-y-2">
                  <div className="font-medium text-amber-100">AI 제안</div>
                  {data.proposals.map((p, i) => (
                    <details
                      key={`${p.lessonKey}/${p.sectionId}/${i}`}
                      className="rounded border border-emerald-700/40 bg-emerald-950/30 px-2 py-1.5"
                    >
                      <summary className="cursor-pointer text-emerald-200">
                        {p.lessonKey} §{p.sectionId} — {p.proposedCheckType}
                        <span className="ml-2 text-[10px] text-emerald-400/70">
                          confidence {(p.confidence * 100).toFixed(0)}
                        </span>
                      </summary>
                      <pre className="mt-1 whitespace-pre-wrap rounded bg-zinc-950/60 px-2 py-1 text-[10px] text-emerald-100">
{p.proposedCheckYaml}
                      </pre>
                      {p.starterCode && (
                        <pre className="mt-1 whitespace-pre-wrap rounded bg-zinc-950/60 px-2 py-1 text-[10px] text-zinc-100">
{p.starterCode}
                        </pre>
                      )}
                      {p.reasoning && (
                        <div className="mt-1 text-[10px] text-emerald-300/80">{p.reasoning}</div>
                      )}
                    </details>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
