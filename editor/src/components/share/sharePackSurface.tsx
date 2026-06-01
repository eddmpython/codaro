import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Archive,
  CheckCircle2,
  Download,
  Eye,
  ExternalLink,
  FileText,
  Loader2,
  PackageOpen,
  PlusCircle,
  RefreshCw,
  Trash2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  createSharePackAutomationTask,
  exportSharePackArchive,
  inspectSharePackSource,
  installSharePackSource,
  loadSharePackAutomation,
  loadSharePackLibrary,
  removeInstalledSharePack,
} from "@/lib/sharePackOperations";
import type {
  SharePackAutomationPayload,
  SharePackIssue,
  SharePackListPayload,
  SharePackPreview,
  SharePackRecord,
  SharePackStatusPayload,
} from "@/types";

type SharePackSurfaceProps = {
  apiOnline: boolean;
  onOpenCurriculum: (packId: string, path: string, version?: string | null) => Promise<void>;
  onTaskCreated: () => void;
};

type BusyState = "idle" | "loading" | "installing" | "removing" | "exporting";

const officialGalleryUrl = "https://eddmpython.github.io/codaro/packs";

export function SharePackSurface({ apiOnline, onOpenCurriculum, onTaskCreated }: SharePackSurfaceProps) {
  const [source, setSource] = useState("");
  const [exportSourceDir, setExportSourceDir] = useState("");
  const [exportOutputPath, setExportOutputPath] = useState("");
  const [busy, setBusy] = useState<BusyState>("idle");
  const [actionKey, setActionKey] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [automationPreview, setAutomationPreview] = useState<SharePackAutomationPayload | null>(null);
  const [preview, setPreview] = useState<SharePackPreview | null>(null);
  const [status, setStatus] = useState<SharePackStatusPayload | null>(null);
  const [packs, setPacks] = useState<SharePackListPayload>({ packs: [], total: 0 });
  const isBusy = busy !== "idle";

  const loadInstalled = useCallback(async () => {
    if (!apiOnline) return;
    const snapshot = await loadSharePackLibrary();
    setStatus(snapshot.status);
    setPacks(snapshot.packs);
  }, [apiOnline]);

  useEffect(() => {
    void loadInstalled().catch((loadError) => {
      setError(loadError instanceof Error ? loadError.message : String(loadError));
    });
  }, [loadInstalled]);

  async function inspectPack() {
    const trimmedSource = source.trim();
    if (!trimmedSource || isBusy) return;
    setBusy("loading");
    setError("");
    setNotice("");
    try {
      const nextPreview = await inspectSharePackSource(trimmedSource);
      setPreview(nextPreview);
    } catch (inspectError) {
      setPreview(null);
      setError(inspectError instanceof Error ? inspectError.message : String(inspectError));
    } finally {
      setBusy("idle");
    }
  }

  async function installPack() {
    const trimmedSource = source.trim();
    if (!trimmedSource || !preview?.installable || isBusy) return;
    setBusy("installing");
    setError("");
    setNotice("");
    try {
      await installSharePackSource(trimmedSource);
      await loadInstalled();
      setNotice("공유 팩을 설치했습니다.");
    } catch (installError) {
      setError(installError instanceof Error ? installError.message : String(installError));
    } finally {
      setBusy("idle");
    }
  }

  async function removePack(pack: SharePackRecord) {
    if (isBusy) return;
    setBusy("removing");
    setError("");
    setNotice("");
    try {
      await removeInstalledSharePack(pack);
      await loadInstalled();
      setAutomationPreview(null);
      setNotice(`${pack.title} 팩을 제거했습니다.`);
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : String(removeError));
    } finally {
      setBusy("idle");
    }
  }

  async function openCurriculum(pack: SharePackRecord, path: string) {
    const key = contentActionKey("curriculum", pack, path);
    if (actionKey) return;
    setActionKey(key);
    setError("");
    setNotice("");
    try {
      await onOpenCurriculum(pack.id, path, pack.version);
    } catch (openError) {
      setError(openError instanceof Error ? openError.message : String(openError));
    } finally {
      setActionKey(null);
    }
  }

  async function previewAutomationRecipe(pack: SharePackRecord, path: string) {
    const key = contentActionKey("automation-preview", pack, path);
    if (actionKey) return;
    setActionKey(key);
    setError("");
    setNotice("");
    try {
      setAutomationPreview(await loadSharePackAutomation(pack, path));
    } catch (previewError) {
      setError(previewError instanceof Error ? previewError.message : String(previewError));
    } finally {
      setActionKey(null);
    }
  }

  async function createAutomationTask(pack: SharePackRecord, path: string) {
    const key = contentActionKey("automation-task", pack, path);
    if (actionKey) return;
    setActionKey(key);
    setError("");
    setNotice("");
    try {
      const task = await createSharePackAutomationTask(pack, path);
      onTaskCreated();
      setNotice(`자동화 태스크를 등록했습니다: ${task.name}`);
    } catch (taskError) {
      setError(taskError instanceof Error ? taskError.message : String(taskError));
    } finally {
      setActionKey(null);
    }
  }

  async function exportPackArchive() {
    const sourceDir = exportSourceDir.trim();
    const outputPath = exportOutputPath.trim();
    if (!sourceDir || !outputPath || isBusy) return;
    setBusy("exporting");
    setError("");
    setNotice("");
    try {
      const exportedPath = await exportSharePackArchive(sourceDir, outputPath);
      setNotice(`공유용 zip을 만들었습니다: ${exportedPath}`);
    } catch (exportError) {
      setError(exportError instanceof Error ? exportError.message : String(exportError));
    } finally {
      setBusy("idle");
    }
  }

  return (
    <div className="h-full min-h-0 overflow-hidden bg-background">
      <ScrollArea className="h-full">
        <main className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-5 py-5">
          <section className="flex flex-col gap-3 border-b pb-4">
            <div className="flex min-w-0 items-center gap-2">
              <PackageOpen className="size-5 text-muted-foreground" />
              <h1 className="truncate text-lg font-semibold">공유 팩</h1>
              <Badge variant="outline">local</Badge>
              <a
                className="ml-auto inline-flex min-h-8 items-center gap-1 rounded-md border px-2 text-xs font-medium text-muted-foreground hover:text-foreground"
                href={officialGalleryUrl}
                rel="noreferrer"
                target="_blank"
              >
                공식 갤러리
                <ExternalLink className="size-3.5" />
              </a>
            </div>
            <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_auto_auto]">
              <Input
                className="h-9"
                placeholder="pack 폴더, zip, codaroPack.yaml URL"
                value={source}
                onChange={(event) => setSource(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") void inspectPack();
                }}
              />
              <Button disabled={!apiOnline || !source.trim() || isBusy} type="button" variant="outline" onClick={inspectPack}>
                {busy === "loading" ? <Loader2 className="animate-spin" /> : <RefreshCw />}
                검사
              </Button>
              <Button disabled={!preview?.installable || isBusy} type="button" onClick={installPack}>
                {busy === "installing" ? <Loader2 className="animate-spin" /> : <Download />}
                설치
              </Button>
            </div>
            {status ? (
              <p className="break-all text-xs text-muted-foreground">store: {status.storageRoot}</p>
            ) : null}
            {error ? <SurfaceAlert tone="error" text={error} /> : null}
            {notice ? <SurfaceAlert tone="success" text={notice} /> : null}
          </section>

          <Card className="rounded-md shadow-none">
            <CardHeader className="pb-3">
              <div className="flex min-w-0 items-start gap-2">
                <Archive className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <CardTitle className="text-sm">공유용 pack 내보내기</CardTitle>
                  <CardDescription className="mt-1">
                    `codaroPack.yaml`이 있는 폴더를 zip으로 묶어 GitHub Release나 Pages에 올릴 수 있습니다.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid gap-2 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
              <Input
                className="h-9"
                placeholder="pack 폴더 경로"
                value={exportSourceDir}
                onChange={(event) => setExportSourceDir(event.target.value)}
              />
              <Input
                className="h-9"
                placeholder="출력 zip 경로"
                value={exportOutputPath}
                onChange={(event) => setExportOutputPath(event.target.value)}
              />
              <Button
                disabled={!apiOnline || !exportSourceDir.trim() || !exportOutputPath.trim() || isBusy}
                type="button"
                variant="outline"
                onClick={exportPackArchive}
              >
                {busy === "exporting" ? <Loader2 className="animate-spin" /> : <Archive />}
                zip 만들기
              </Button>
            </CardContent>
          </Card>

          {preview ? <PreviewPanel preview={preview} /> : null}
          {automationPreview ? <AutomationPreviewPanel preview={automationPreview} /> : null}

          <section className="grid gap-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold">설치된 팩</h2>
              <Button disabled={!apiOnline || isBusy} size="sm" type="button" variant="outline" onClick={() => void loadInstalled()}>
                <RefreshCw />
                새로고침
              </Button>
            </div>
            {packs.packs.length ? (
              <div className="grid gap-3 lg:grid-cols-2">
                {packs.packs.map((pack) => (
                  <InstalledPackCard
                    actionKey={actionKey}
                    key={`${pack.id}@${pack.version}`}
                    pack={pack}
                    removing={busy === "removing"}
                    onCreateAutomationTask={createAutomationTask}
                    onOpenCurriculum={openCurriculum}
                    onPreviewAutomation={previewAutomationRecipe}
                    onRemove={removePack}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                설치된 공유 팩이 없습니다.
              </div>
            )}
          </section>
        </main>
      </ScrollArea>
    </div>
  );
}

function AutomationPreviewPanel({ preview }: { preview: SharePackAutomationPayload }) {
  return (
    <Card className="rounded-md shadow-none">
      <CardHeader>
        <div className="flex min-w-0 items-start gap-2">
          <Eye className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <div className="min-w-0">
            <CardTitle className="truncate">자동화 recipe 미리보기</CardTitle>
            <CardDescription className="mt-1 break-all">
              {preview.packId} · {preview.contentPath}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-2">
        <div className="break-all rounded-md border bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
          {preview.documentPath}
        </div>
        <div className="max-h-96 overflow-auto rounded-md border bg-code">
          <pre className="min-w-max whitespace-pre-wrap p-3 font-mono text-xs leading-5 text-code-foreground">
            {preview.content}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
}

function PreviewPanel({ preview }: { preview: SharePackPreview }) {
  const errorCount = preview.issues.filter((issue) => issue.severity === "error").length;
  const warningCount = preview.issues.filter((issue) => issue.severity === "warning").length;
  return (
    <Card className="rounded-md shadow-none">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="truncate">{preview.manifest?.title ?? "검사 결과"}</CardTitle>
            <CardDescription className="mt-1 break-all">{preview.manifest?.id ?? preview.source}</CardDescription>
          </div>
          <Badge variant={preview.installable ? "default" : "destructive"}>
            {preview.installable ? "설치 가능" : "설치 차단"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-3">
        <PackStats preview={preview} />
        {preview.issues.length ? (
          <div className="grid gap-2">
            <div className="text-xs text-muted-foreground">error {errorCount} · warning {warningCount}</div>
            <div className="grid gap-2">
              {preview.issues.map((issue, index) => (
                <IssueRow issue={issue} key={`${issue.code}-${issue.path ?? ""}-${index}`} />
              ))}
            </div>
          </div>
        ) : (
          <SurfaceAlert tone="success" text="검사 문제가 없습니다." />
        )}
      </CardContent>
    </Card>
  );
}

function PackStats({ preview }: { preview: SharePackPreview }) {
  const stats = useMemo(() => [
    ["커리큘럼", preview.contentCounts.curricula ?? 0],
    ["자동화", preview.contentCounts.automations ?? 0],
    ["자산", preview.contentCounts.assets ?? 0],
    ["파일", preview.files.length],
  ], [preview]);
  return (
    <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
      {stats.map(([label, count]) => (
        <div className="rounded-md border bg-muted/20 px-3 py-2" key={label}>
          <div className="text-[11px] text-muted-foreground">{label}</div>
          <div className="mt-1 text-sm font-semibold">{count}</div>
        </div>
      ))}
    </div>
  );
}

function IssueRow({ issue }: { issue: SharePackIssue }) {
  const isError = issue.severity === "error";
  const Icon = isError ? AlertTriangle : CheckCircle2;
  return (
    <div className="flex gap-2 rounded-md border px-3 py-2 text-sm">
      <Icon className={isError ? "mt-0.5 size-4 shrink-0 text-destructive" : "mt-0.5 size-4 shrink-0 text-amber-500"} />
      <div className="min-w-0">
        <div className="font-medium">{issue.message}</div>
        <div className="mt-0.5 break-all text-xs text-muted-foreground">
          {issue.code}{issue.path ? ` · ${issue.path}` : ""}
        </div>
      </div>
    </div>
  );
}

function InstalledPackCard({
  actionKey,
  pack,
  removing,
  onCreateAutomationTask,
  onOpenCurriculum,
  onPreviewAutomation,
  onRemove,
}: {
  actionKey: string | null;
  pack: SharePackRecord;
  removing: boolean;
  onCreateAutomationTask: (pack: SharePackRecord, path: string) => void;
  onOpenCurriculum: (pack: SharePackRecord, path: string) => void;
  onPreviewAutomation: (pack: SharePackRecord, path: string) => void;
  onRemove: (pack: SharePackRecord) => void;
}) {
  const curricula = pack.contents.curricula ?? [];
  const automations = pack.contents.automations ?? [];
  return (
    <Card className="rounded-md shadow-none">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <CardTitle className="truncate">{pack.title}</CardTitle>
            <CardDescription className="mt-1 truncate">{pack.id} · {pack.version}</CardDescription>
          </div>
          <Button
            aria-label={`${pack.title} 제거`}
            disabled={removing}
            size="icon"
            type="button"
            variant="outline"
            onClick={() => onRemove(pack)}
          >
            {removing ? <Loader2 className="animate-spin" /> : <Trash2 />}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="grid gap-2 text-xs text-muted-foreground">
        <div className="flex flex-wrap gap-1">
          <Badge variant="outline">커리큘럼 {pack.contentCounts.curricula ?? 0}</Badge>
          <Badge variant="outline">자동화 {pack.contentCounts.automations ?? 0}</Badge>
          <Badge variant="outline">패키지 {pack.packages.length}</Badge>
        </div>
        <div className="break-all">{pack.rootPath}</div>
        {curricula.length ? (
          <div className="mt-2 grid gap-2">
            <div className="flex items-center gap-1 text-[11px] font-medium text-foreground">
              <FileText className="size-3.5" />
              커리큘럼
            </div>
            {curricula.map((path) => {
              const key = contentActionKey("curriculum", pack, path);
              return (
                <div className="flex items-center justify-between gap-2 rounded-md border px-2 py-2" key={path}>
                  <span className="min-w-0 break-all">{path}</span>
                  <Button
                    disabled={Boolean(actionKey) || removing}
                    size="sm"
                    type="button"
                    variant="outline"
                    onClick={() => onOpenCurriculum(pack, path)}
                  >
                    {actionKey === key ? <Loader2 className="animate-spin" /> : <FileText />}
                    열기
                  </Button>
                </div>
              );
            })}
          </div>
        ) : null}
        {automations.length ? (
          <div className="mt-2 grid gap-2">
            <div className="flex items-center gap-1 text-[11px] font-medium text-foreground">
              <PackageOpen className="size-3.5" />
              자동화
            </div>
            {automations.map((path) => {
              const previewKey = contentActionKey("automation-preview", pack, path);
              const taskKey = contentActionKey("automation-task", pack, path);
              return (
                <div className="grid gap-2 rounded-md border px-2 py-2" key={path}>
                  <span className="min-w-0 break-all">{path}</span>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      disabled={Boolean(actionKey) || removing}
                      size="sm"
                      type="button"
                      variant="outline"
                      onClick={() => onPreviewAutomation(pack, path)}
                    >
                      {actionKey === previewKey ? <Loader2 className="animate-spin" /> : <Eye />}
                      보기
                    </Button>
                    <Button
                      disabled={Boolean(actionKey) || removing}
                      size="sm"
                      type="button"
                      variant="outline"
                      onClick={() => onCreateAutomationTask(pack, path)}
                    >
                      {actionKey === taskKey ? <Loader2 className="animate-spin" /> : <PlusCircle />}
                      태스크 등록
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function contentActionKey(kind: string, pack: SharePackRecord, path: string) {
  return `${kind}:${pack.id}@${pack.version}:${path}`;
}

function SurfaceAlert({ tone, text }: { tone: "success" | "error"; text: string }) {
  const Icon = tone === "success" ? CheckCircle2 : AlertTriangle;
  return (
    <div className={tone === "success"
      ? "flex items-start gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/5 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300"
      : "flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
    }>
      <Icon className="mt-0.5 size-4 shrink-0" />
      <span className="min-w-0 break-words">{text}</span>
    </div>
  );
}

export default SharePackSurface;
