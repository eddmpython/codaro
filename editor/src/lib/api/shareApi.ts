import { deleteJson, postJson, requestJson } from "./transport";
import type { CurriculumLessonPayload, SharePackAutomationPayload, SharePackListPayload, SharePackPreview, SharePackRecord, SharePackStatusPayload, TaskDefinition } from "@/types";

export const shareApi = {
sharePackStatus: () => requestJson<SharePackStatusPayload>("/api/share/packs/status"),
sharePacks: () => requestJson<SharePackListPayload>("/api/share/packs"),
inspectSharePack: (source: string) => postJson<SharePackPreview>("/api/share/packs/inspect", { source }),
installSharePack: (source: string) => postJson<{ pack: SharePackRecord }>("/api/share/packs/install", { source }),
exportSharePack: (sourceDir: string, outputPath: string) => postJson<{ outputPath: string }>(
    "/api/share/packs/export",
    { sourceDir, outputPath },
  ),
sharePackCurriculum: (packId: string, path: string, version?: string | null) => {
    const params = new URLSearchParams({ path });
    if (version) params.set("version", version);
    return requestJson<CurriculumLessonPayload>(
      `/api/share/packs/${encodeURIComponent(packId)}/curriculum?${params.toString()}`,
    );
  },
sharePackAutomation: (packId: string, path: string, version?: string | null) => {
    const params = new URLSearchParams({ path });
    if (version) params.set("version", version);
    return requestJson<SharePackAutomationPayload>(
      `/api/share/packs/${encodeURIComponent(packId)}/automation?${params.toString()}`,
    );
  },
createSharePackAutomationTask: (packId: string, payload: {
    path: string;
    name?: string;
    description?: string;
    schedule?: string | null;
    version?: string | null;
  }) => {
    const params = new URLSearchParams();
    if (payload.version) params.set("version", payload.version);
    const query = params.toString();
    return postJson<{ task: TaskDefinition }>(
      `/api/share/packs/${encodeURIComponent(packId)}/automation-task${query ? `?${query}` : ""}`,
      {
        path: payload.path,
        name: payload.name ?? "",
        description: payload.description ?? "",
        schedule: payload.schedule ?? null,
      },
    );
  },
uninstallSharePack: (packId: string, version?: string | null) => {
    const params = new URLSearchParams();
    if (version) params.set("version", version);
    const query = params.toString();
    return deleteJson<{ ok: boolean }>(`/api/share/packs/${encodeURIComponent(packId)}${query ? `?${query}` : ""}`);
  }
};
