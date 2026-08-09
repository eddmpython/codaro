import { Check, Copy, PackageOpen } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import type { RuntimeTarget } from "@/lib/generatedContracts/executableUnit";

export function DeploymentGuide({
  runtimeTarget,
  sourcePath,
}: {
  runtimeTarget: RuntimeTarget | null;
  sourcePath: string | null;
}) {
  const [copied, setCopied] = useState<string | null>(null);
  const commands = useMemo(
    () => deploymentCommands(runtimeTarget, sourcePath),
    [runtimeTarget, sourcePath],
  );

  if (!sourcePath) {
    return (
      <span className="text-xs text-muted-foreground" data-deployment-guide="save-required">
        배포하려면 먼저 이 문서를 Python 파일로 저장하세요.
      </span>
    );
  }
  if (!commands.length) {
    return (
      <span className="text-xs text-destructive" data-deployment-guide="blocked">
        현재 기능 블록 계약으로는 웹 bundle을 만들 수 없습니다.
      </span>
    );
  }

  const copy = async (id: string, command: string) => {
    await navigator.clipboard.writeText(command);
    setCopied(id);
    window.setTimeout(() => setCopied((current) => (current === id ? null : current)), 1600);
  };

  return (
    <details className="text-xs text-muted-foreground" data-deployment-guide="ready">
      <summary className="flex cursor-pointer list-none items-center gap-1.5 py-1.5 font-medium text-foreground">
        <PackageOpen className="size-3.5" />
        배포 산출물
      </summary>
      <div className="absolute right-3 mt-1 grid w-[min(34rem,calc(100vw-1.5rem))] gap-2 rounded-md border bg-popover p-3 shadow-lg sm:right-5">
        <p>같은 검증 bundle을 폴더, ZIP, self-host로 내보냅니다. 외부 provider는 이 bundle만 전달합니다.</p>
        {commands.map((item) => (
          <div className="grid gap-1" key={item.id}>
            <span className="font-medium text-foreground">{item.label}</span>
            <div className="flex min-w-0 items-center gap-2">
              <code className="min-w-0 flex-1 overflow-x-auto rounded bg-muted px-2 py-1.5 text-[11px] text-foreground">
                {item.command}
              </code>
              <Button
                aria-label={`${item.label} 명령 복사`}
                className="size-8"
                size="icon"
                type="button"
                variant="outline"
                onClick={() => void copy(item.id, item.command)}
              >
                {copied === item.id ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </details>
  );
}

type DeploymentCommand = {
  id: string;
  label: string;
  command: string;
};

function deploymentCommands(runtimeTarget: RuntimeTarget | null, sourcePath: string | null): DeploymentCommand[] {
  if (!sourcePath || runtimeTarget === "local" || runtimeTarget === "blocked" || runtimeTarget === null) return [];
  const source = shellQuote(sourcePath);
  const base = sourcePath.replace(/\.[^./\\]+$/, "");
  const publication = shellQuote(`${base}-${runtimeTarget === "server" ? "server" : "site"}`);
  const buildTarget = runtimeTarget === "server" ? "server" : "browser";
  return [
    {
      id: "build",
      label: "검증 bundle 만들기",
      command: `codaro build ${source} --target ${buildTarget} --output ${publication}`,
    },
    {
      id: "zip",
      label: "재현 가능한 ZIP 만들기",
      command: `codaro deploy ${publication} --target zip --output ${shellQuote(`${base}.zip`)}`,
    },
    {
      id: "self-host",
      label: "자체 서버용 폴더 만들기",
      command: `codaro deploy ${publication} --target self-host --output ${shellQuote(`${base}-self-host`)}`,
    },
  ];
}

function shellQuote(value: string): string {
  return `'${value.replaceAll("'", "''")}'`;
}
