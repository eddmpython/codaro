import { useEffect } from "react";
import {
  type AppBootstrapState,
  loadAppBootstrapState,
} from "@/lib/appBootstrap";
import type {
  AiProfile,
  AiToolCatalogPayload,
  AppNotice,
  CodaroDocument,
  LoadState,
} from "@/types";

type UseAppBootstrapEffectOptions = {
  applyBootstrapCurriculumState: (bootstrap: AppBootstrapState) => void;
  applyDocument: (document: CodaroDocument) => void;
  onApiOnline: (apiOnline: boolean) => void;
  onLoadState: (loadState: LoadState) => void;
  onNotice: (notice: AppNotice) => void;
  onProfile: (profile: AiProfile | null) => void;
  onSessionId: (sessionId: string) => void;
  onToolCatalog: (toolCatalog: AiToolCatalogPayload) => void;
  refreshAutomation: () => Promise<void>;
};

export function useAppBootstrapEffect({
  applyBootstrapCurriculumState,
  applyDocument,
  onApiOnline,
  onLoadState,
  onNotice,
  onProfile,
  onSessionId,
  onToolCatalog,
  refreshAutomation,
}: UseAppBootstrapEffectOptions) {
  useEffect(() => {
    let cancelled = false;

    async function initialize() {
      onLoadState("loading");
      const bootstrap = await loadAppBootstrapState();
      if (cancelled) return;
      onApiOnline(bootstrap.apiOnline);
      applyBootstrapCurriculumState(bootstrap);
      onToolCatalog(bootstrap.toolCatalog);
      onProfile(bootstrap.profile);
      if (bootstrap.sessionId) onSessionId(bootstrap.sessionId);
      if (bootstrap.documentToApply) applyDocument(bootstrap.documentToApply);
      if (bootstrap.notice) onNotice(bootstrap.notice);
      if (bootstrap.refreshAutomation) {
        await refreshAutomation();
      }
      if (!cancelled) onLoadState("ready");
    }

    void initialize().catch((error) => {
      if (cancelled) return;
      onLoadState("error");
      onNotice({
        tone: "error",
        title: "시작 실패",
        detail: error instanceof Error ? error.message : String(error),
      });
    });

    return () => {
      cancelled = true;
    };
  }, [
    applyBootstrapCurriculumState,
    applyDocument,
    onApiOnline,
    onLoadState,
    onNotice,
    onProfile,
    onSessionId,
    onToolCatalog,
    refreshAutomation,
  ]);
}
