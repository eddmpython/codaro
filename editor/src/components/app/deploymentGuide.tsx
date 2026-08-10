import { ExternalLink, PackageCheck, PackageOpen, RotateCcw, ServerOff } from "lucide-react";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  publicationOperations,
  type PublicationDeploymentTarget,
  type PublicationJob,
  type PublicationTarget,
} from "@/lib/publicationOperations";
import type { RuntimeTarget } from "@/lib/generatedContracts/executableUnit";

export function DeploymentGuide({
  entryBlockId,
  runtimeTarget,
  sourcePath,
  sourceFingerprint,
}: {
  entryBlockId: string | null;
  runtimeTarget: RuntimeTarget | null;
  sourcePath: string | null;
  sourceFingerprint: string;
}) {
  const [job, setJob] = useState<PublicationJob | null>(null);
  const [outputPath, setOutputPath] = useState<string | null>(null);
  const [publicationTarget, setPublicationTarget] = useState<PublicationTarget | null>(null);
  const [bundleHash, setBundleHash] = useState<string | null>(null);
  const [previousBundleHash, setPreviousBundleHash] = useState<string | null>(null);
  const [policyHash, setPolicyHash] = useState<string | null>(null);
  const [permissionScopes, setPermissionScopes] = useState<string[]>([]);
  const [builtFingerprint, setBuiltFingerprint] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null);
  const [serverId, setServerId] = useState<string | null>(null);
  const [serverUrl, setServerUrl] = useState<string | null>(null);
  const [deployment, setDeployment] = useState<{
    outputPath: string;
    previousVersionId: string | null;
    target: PublicationDeploymentTarget;
  } | null>(null);
  const availableTarget = runtimeTarget === "browser" || runtimeTarget === "server" || runtimeTarget === "local"
    ? runtimeTarget
    : null;
  const destinations = useMemo(() => sourcePath ? deploymentPaths(sourcePath) : null, [sourcePath]);

  if (!sourcePath) {
    return (
      <span className="text-xs text-muted-foreground" data-deployment-guide="save-required">
        배포하려면 먼저 이 문서를 Python 파일로 저장하세요.
      </span>
    );
  }
  if (!availableTarget) {
    return (
      <span className="text-xs text-destructive" data-deployment-guide="blocked">
        현재 기능 블록 계약으로는 배포 bundle을 만들 수 없습니다.
      </span>
    );
  }

  const run = async (operation: () => Promise<PublicationJob>) => {
    try {
      let next = await operation();
      setJob(next);
      while (next.status === "running") {
        await new Promise((resolve) => window.setTimeout(resolve, 200));
        next = await publicationOperations.getPublicationJob(next.id);
        setJob(next);
      }
      return next;
    } catch (error) {
      const failed: PublicationJob = {
        id: "transport-error",
        action: "build",
        status: "failed",
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        result: {},
        error: {
          code: "publication_transport_failed",
          message: error instanceof Error ? error.message : String(error),
          diagnostics: [],
        },
      };
      setJob(failed);
      return failed;
    }
  };
  const build = async (target: PublicationTarget) => {
    const next = await run(() => publicationOperations.buildPublication(sourcePath, target, entryBlockId ?? undefined));
    if (next.status !== "completed") return;
    const nextOutputPath = readString(next.result, "outputPath");
    const nextBundleHash = readString(next.result, "bundleHash");
    if (outputPath === nextOutputPath && publicationTarget === target && bundleHash && bundleHash !== nextBundleHash) {
      setPreviousBundleHash(bundleHash);
    }
    setOutputPath(nextOutputPath);
    setPublicationTarget(target);
    setBundleHash(nextBundleHash);
    setPolicyHash(readNullableString(next.result, "policyHash"));
    setPermissionScopes(readStringList(next.result, "permissionScopes"));
    setBuiltFingerprint(sourceFingerprint);
    setVerificationStatus(readNullableString(next.result, "verificationStatus"));
    setServerId(null);
    setServerUrl(null);
    setDeployment(null);
  };
  const serve = async () => {
    if (!outputPath || !publicationTarget) return;
    const next = await run(() => publicationOperations.servePublication(
      outputPath,
      publicationTarget,
      publicationTarget === "local" ? policyHash ?? undefined : undefined,
    ));
    if (next.status !== "completed") return;
    setServerId(readString(next.result, "serverId"));
    setServerUrl(readString(next.result, "url"));
  };
  const verify = async () => {
    if (!outputPath || !publicationTarget) return;
    const next = await run(() => publicationOperations.verifyPublication(outputPath, publicationTarget));
    if (next.status === "completed") {
      setVerificationStatus(readNullableString(next.result, "verificationStatus"));
    }
  };
  const stop = async () => {
    if (!serverId) return;
    const next = await run(() => publicationOperations.stopPublication(serverId));
    if (next.status === "completed") {
      setServerId(null);
      setServerUrl(null);
    }
  };
  const deploy = async (target: PublicationDeploymentTarget) => {
    if (!outputPath || !destinations) return;
    const destination = destinations[target];
    const next = await run(() => publicationOperations.deployPublication(outputPath, destination, target));
    if (next.status !== "completed") return;
    setDeployment({
      outputPath: destination,
      previousVersionId: readNullableString(next.result, "previousVersionId"),
      target,
    });
  };
  const rollback = async () => {
    if (!deployment?.previousVersionId) return;
    await run(() => publicationOperations.rollbackPublication(
      deployment.outputPath,
      deployment.target,
      deployment.previousVersionId ?? "",
    ));
  };
  const rollbackBundle = async () => {
    if (!outputPath || !publicationTarget || !previousBundleHash) return;
    const next = await run(() => publicationOperations.rollbackPublication(
      outputPath,
      publicationTarget,
      previousBundleHash,
    ));
    if (next.status !== "completed") return;
    const restored = previousBundleHash;
    setPreviousBundleHash(bundleHash);
    setBundleHash(restored);
    setServerId(null);
    setServerUrl(null);
  };

  return (
    <details className="text-xs text-muted-foreground" data-deployment-guide="ready">
      <summary className="flex cursor-pointer list-none items-center gap-1.5 py-1.5 font-medium text-foreground">
        <PackageOpen className="size-3.5" />
        앱 만들기
      </summary>
      <div className="absolute right-3 mt-1 grid w-[min(38rem,calc(100vw-1.5rem))] gap-3 rounded-md border bg-popover p-3 shadow-lg sm:right-5">
        <div className="flex flex-wrap gap-2" data-publication-actions="build">
          <ActionButton
            label={availableTarget === "local" ? "로컬 앱 build" : "웹 앱 build"}
            onClick={() => void build(availableTarget)}
          />
          {availableTarget === "browser" && entryBlockId ? (
            <ActionButton label="선택 블록 embed" onClick={() => void build("embed")} />
          ) : null}
          {outputPath && publicationTarget ? (
            <ActionButton
              label="bundle 검증"
              onClick={() => void verify()}
            />
          ) : null}
          {outputPath && publicationTarget && !serverId && publicationTarget !== "local" ? (
            <ActionButton label="로컬에서 열기" onClick={() => void serve()} />
          ) : null}
          {serverId ? (
            <ActionButton icon={<ServerOff className="size-3.5" />} label="서버 중지" onClick={() => void stop()} />
          ) : null}
        </div>

        {outputPath && publicationTarget === "local" ? (
          <div className="grid gap-2 rounded border p-2" data-local-publication-approval="required">
            <span className="font-medium text-foreground">이 로컬 앱에 허용할 권한</span>
            <p>{permissionScopes.length ? permissionScopes.join(", ") : "추가 권한 없음"}</p>
            <p className="break-all text-[10px]">policy {policyHash ?? "확인 불가"}</p>
            {!serverId ? (
              <ActionButton label="권한 확인 후 열기" onClick={() => void serve()} />
            ) : null}
          </div>
        ) : null}

        {outputPath && publicationTarget && previousBundleHash ? (
          <ActionButton
            icon={<RotateCcw className="size-3.5" />}
            label="이전 build 복원"
            onClick={() => void rollbackBundle()}
          />
        ) : null}

        {outputPath ? (
          <PublicationProofStatus
            blocked={job?.status === "failed"}
            stale={builtFingerprint !== sourceFingerprint}
            verificationStatus={verificationStatus}
          />
        ) : null}

        {serverUrl ? (
          <a
            className="inline-flex w-fit items-center gap-1.5 font-medium text-foreground underline underline-offset-4"
            data-publication-open="true"
            href={serverUrl}
            rel="noreferrer"
            target="_blank"
          >
            실행 중인 앱 열기 <ExternalLink className="size-3.5" />
          </a>
        ) : null}

        {outputPath && destinations && publicationTarget !== "local" ? (
          <div className="grid gap-2 border-t pt-3" data-publication-actions="deploy">
            <span className="font-medium text-foreground">검증한 bundle 내보내기</span>
            <div className="flex flex-wrap gap-2">
              <ActionButton label="폴더" onClick={() => void deploy("folder")} />
              <ActionButton label="ZIP" onClick={() => void deploy("zip")} />
              <ActionButton label="self-host" onClick={() => void deploy("self-host")} />
              {deployment?.previousVersionId ? (
                <ActionButton
                  icon={<RotateCcw className="size-3.5" />}
                  label="이전 버전 복원"
                  onClick={() => void rollback()}
                />
              ) : null}
            </div>
          </div>
        ) : null}

        {job ? <PublicationJobStatus job={job} /> : (
          <p>터미널 없이 immutable bundle을 만들고 검증한 뒤 실행하거나 내보냅니다.</p>
        )}
      </div>
    </details>
  );
}

function ActionButton({
  icon,
  label,
  onClick,
}: {
  icon?: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <Button className="h-8 gap-1.5" size="sm" type="button" variant="outline" onClick={onClick}>
      {icon ?? <PackageCheck className="size-3.5" />}
      {label}
    </Button>
  );
}

function PublicationJobStatus({ job }: { job: PublicationJob }) {
  const receiptId = readNullableString(job.result, "receiptId");
  return (
    <div
      className={job.status === "failed" ? "rounded border border-destructive/40 p-2 text-destructive" : "rounded border p-2"}
      data-publication-job={job.status}
      data-publication-job-action={job.action}
      data-publication-job-id={job.id}
    >
      <p className="font-medium">
        {job.status === "completed" ? "완료" : job.status === "failed" ? "차단됨" : "진행 중"}
      </p>
      {job.error ? <p className="mt-1 break-words">{job.error.message}</p> : null}
      {job.error?.diagnostics.map((diagnostic, index) => (
        <p className="mt-1 break-words" key={`${diagnostic.code ?? "diagnostic"}-${index}`}>
          {diagnostic.sourceSpan?.path ?? "문서"}:{diagnostic.sourceSpan?.startLine ?? 1} {diagnostic.message}
        </p>
      ))}
      {receiptId ? <p className="mt-1 break-all text-[10px]">receipt {receiptId}</p> : null}
    </div>
  );
}

function PublicationProofStatus({
  blocked,
  stale,
  verificationStatus,
}: {
  blocked: boolean;
  stale: boolean;
  verificationStatus: string | null;
}) {
  const state = blocked ? "blocked" : stale ? "stale" : verificationStatus === "verified" ? "verified" : "unverified";
  const copy = state === "blocked"
    ? "차단됨: 현재 작업이 완료되지 않아 이 bundle을 증거로 사용할 수 없습니다."
    : state === "stale"
      ? "낡음: source 또는 app 구성이 바뀌었습니다. 다시 build해야 합니다."
      : state === "verified"
        ? "검증됨: source, 실행, 학습 증거 계보가 현재 bundle hash에 연결됐습니다."
        : "bundle 무결성은 확인했지만 연결된 학습 증거는 없습니다.";
  return (
    <p className="rounded border px-2 py-1.5" data-publication-proof-state={state}>
      {copy}
    </p>
  );
}

function deploymentPaths(sourcePath: string): Record<PublicationDeploymentTarget, string> {
  const base = sourcePath.replace(/\.[^./\\]+$/, "");
  return {
    folder: `${base}-deploy`,
    zip: `${base}.zip`,
    "self-host": `${base}-self-host`,
  };
}

function readString(value: Record<string, unknown>, key: string): string {
  const item = value[key];
  return typeof item === "string" ? item : "";
}

function readNullableString(value: Record<string, unknown>, key: string): string | null {
  const item = value[key];
  return typeof item === "string" && item ? item : null;
}

function readStringList(value: Record<string, unknown>, key: string): string[] {
  const item = value[key];
  return Array.isArray(item) ? item.filter((entry): entry is string => typeof entry === "string") : [];
}
