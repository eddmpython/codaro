import { codaroApi } from "@/lib/api";
import type {
  SharePackAutomationPayload,
  SharePackListPayload,
  SharePackPreview,
  SharePackRecord,
  SharePackStatusPayload,
  TaskDefinition,
  CurriculumLessonPayload,
} from "@/types";

export type SharePackLibrarySnapshot = {
  packs: SharePackListPayload;
  status: SharePackStatusPayload;
};

export async function loadSharePackLibrary(): Promise<SharePackLibrarySnapshot> {
  const [status, packs] = await Promise.all([
    codaroApi.sharePackStatus(),
    codaroApi.sharePacks(),
  ]);
  return { status, packs };
}

export async function inspectSharePackSource(source: string): Promise<SharePackPreview> {
  return codaroApi.inspectSharePack(source);
}

export async function installSharePackSource(source: string): Promise<void> {
  await codaroApi.installSharePack(source);
}

export async function removeInstalledSharePack(pack: SharePackRecord): Promise<void> {
  await codaroApi.uninstallSharePack(pack.id, pack.version);
}

export async function loadSharePackAutomation(pack: SharePackRecord, path: string): Promise<SharePackAutomationPayload> {
  return codaroApi.sharePackAutomation(pack.id, path, pack.version);
}

export async function loadSharePackCurriculum(packId: string, path: string, version?: string | null): Promise<CurriculumLessonPayload> {
  return codaroApi.sharePackCurriculum(packId, path, version);
}

export async function createSharePackAutomationTask(pack: SharePackRecord, path: string): Promise<TaskDefinition> {
  const payload = await codaroApi.createSharePackAutomationTask(pack.id, {
    path,
    version: pack.version,
  });
  return payload.task;
}

export async function exportSharePackArchive(sourceDir: string, outputPath: string): Promise<string> {
  const payload = await codaroApi.exportSharePack(sourceDir, outputPath);
  return payload.outputPath;
}
