import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { ReactiveDiagnostics, VariableInfo } from "@/types";

export function VariableExplorerPanel({
  variables,
  diagnostics,
  onSelectBlock,
}: {
  variables: VariableInfo[];
  diagnostics: ReactiveDiagnostics;
  onSelectBlock: (blockId: string) => void;
}) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return variables;
    return variables.filter(
      (variable) =>
        variable.name.toLowerCase().includes(needle) || variable.typeName.toLowerCase().includes(needle),
    );
  }, [variables, query]);

  const multiDefined = useMemo(
    () => new Set(diagnostics.multipleDefinitions.map(([name]) => name)),
    [diagnostics.multipleDefinitions],
  );

  return (
    <aside className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)] bg-background">
      <div className="flex items-center gap-2 border-b px-3 py-2">
        <Search className="size-3.5 shrink-0 text-muted-foreground" />
        <Input
          aria-label="변수 검색"
          className="h-7 border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0"
          placeholder="변수 검색"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <span className="shrink-0 text-[11px] text-muted-foreground">{filtered.length}</span>
      </div>
      <ScrollArea className="h-full min-h-0">
        {filtered.length ? (
          <div className="space-y-1 p-2">
            {filtered.map((variable) => {
              const definer = (diagnostics.definedBy[variable.name] ?? []).at(-1);
              return (
                <button
                  key={variable.name}
                  type="button"
                  disabled={!definer}
                  className={cn(
                    "w-full rounded-md border bg-card px-2.5 py-1.5 text-left transition-colors",
                    definer ? "hover:border-ring/50" : "cursor-default opacity-90",
                  )}
                  title={definer ? "정의한 셀로 이동" : undefined}
                  onClick={() => {
                    if (definer) onSelectBlock(definer);
                  }}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="truncate font-mono text-sm font-medium">{variable.name}</span>
                    <span className="truncate text-[11px] text-muted-foreground">{variable.typeName}</span>
                    {multiDefined.has(variable.name) ? (
                      <Badge
                        variant="outline"
                        className="ml-auto shrink-0 border-amber-500/40 text-amber-700 dark:text-amber-400"
                      >
                        다중정의
                      </Badge>
                    ) : null}
                  </div>
                  {variable.shape || variable.dtype || variable.size != null ? (
                    <div className="mt-0.5 flex flex-wrap gap-x-2 text-[11px] text-muted-foreground">
                      {variable.shape ? <span>shape {variable.shape}</span> : null}
                      {variable.dtype ? <span>dtype {variable.dtype}</span> : null}
                      {variable.size != null ? <span>크기 {variable.size}</span> : null}
                    </div>
                  ) : null}
                  <div className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground">{variable.repr}</div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="p-4 text-center text-[12px] text-muted-foreground">
            {variables.length ? "일치하는 변수가 없습니다." : "셀을 실행하면 변수가 여기 보입니다."}
          </div>
        )}
      </ScrollArea>
    </aside>
  );
}
