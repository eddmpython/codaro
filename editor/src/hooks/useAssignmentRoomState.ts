import { useCallback, useEffect, useState } from "react";

import {
  clearActiveAssignmentSession,
  loadActiveAssignmentSession,
  saveActiveAssignmentSession,
  type ActiveAssignmentSession,
} from "@/lib/classroomSession";
import {
  createAssignmentRoomFromDocument,
  joinAssignmentRoom,
  loadAssignmentDashboard,
  loadAssignmentMaterialForSession,
  publishAssignmentRoom,
} from "@/lib/classroomOperations";
import { recordAssignmentLearningEvent } from "@/lib/classroomEvents";
import type { AssignmentDashboardPayload, CodaroDocument } from "@/types";

export type UseAssignmentRoomStateArgs = {
  category: string;
  contentId: string;
  document: CodaroDocument;
  onOpenMaterial?: (document: CodaroDocument, title: string) => void;
};

export function useAssignmentRoomState({
  category,
  contentId,
  document,
  onOpenMaterial,
}: UseAssignmentRoomStateArgs) {
  const [session, setSession] = useState<ActiveAssignmentSession | null>(() => loadActiveAssignmentSession());
  const [dashboard, setDashboard] = useState<AssignmentDashboardPayload | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const handler = () => setSession(loadActiveAssignmentSession());
    window.addEventListener("codaro:assignment-session-updated", handler);
    return () => window.removeEventListener("codaro:assignment-session-updated", handler);
  }, []);

  const createFromCurrentLesson = useCallback(async () => {
    setBusy(true);
    setError("");
    try {
      const payload = await createAssignmentRoomFromDocument({
        document,
        category,
        contentId,
      });
      setSession(loadActiveAssignmentSession());
      return payload;
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : String(nextError));
      return null;
    } finally {
      setBusy(false);
    }
  }, [category, contentId, document]);

  const publish = useCallback(async () => {
    const active = loadActiveAssignmentSession();
    if (!active) return null;
    setBusy(true);
    setError("");
    try {
      const payload = await publishAssignmentRoom(active);
      setSession(loadActiveAssignmentSession());
      return payload;
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : String(nextError));
      return null;
    } finally {
      setBusy(false);
    }
  }, []);

  const join = useCallback(async (joinCode: string, studentTag: string) => {
    setBusy(true);
    setError("");
    try {
      await joinAssignmentRoom({ joinCode, studentTag });
      const active = loadActiveAssignmentSession();
      setSession(active);
      if (active) {
        const material = await loadAssignmentMaterialForSession(active);
        if (material.material.document) {
          onOpenMaterial?.(material.material.document, material.material.title);
          void recordAssignmentLearningEvent({
            eventType: "materialOpened",
            category: material.material.category,
            contentId: material.material.contentId,
            payload: { title: material.material.title },
          });
        }
      }
      return active;
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : String(nextError));
      return null;
    } finally {
      setBusy(false);
    }
  }, [onOpenMaterial]);

  const openMaterial = useCallback(async () => {
    const active = loadActiveAssignmentSession();
    if (!active) return null;
    setBusy(true);
    setError("");
    try {
      const material = await loadAssignmentMaterialForSession(active);
      if (material.material.document) {
        onOpenMaterial?.(material.material.document, material.material.title);
        void recordAssignmentLearningEvent({
          eventType: "materialOpened",
          category: material.material.category,
          contentId: material.material.contentId,
          payload: { title: material.material.title },
        });
      }
      return material;
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : String(nextError));
      return null;
    } finally {
      setBusy(false);
    }
  }, [onOpenMaterial]);

  const reloadDashboard = useCallback(async () => {
    const active = loadActiveAssignmentSession();
    if (!active?.tutorToken) return null;
    setBusy(true);
    setError("");
    try {
      const payload = await loadAssignmentDashboard(active);
      setDashboard(payload);
      return payload;
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : String(nextError));
      return null;
    } finally {
      setBusy(false);
    }
  }, []);

  const clear = useCallback(() => {
    clearActiveAssignmentSession();
    setSession(null);
    setDashboard(null);
  }, []);

  const restore = useCallback((nextSession: ActiveAssignmentSession) => {
    saveActiveAssignmentSession(nextSession);
    setSession(nextSession);
  }, []);

  return {
    busy,
    clear,
    createFromCurrentLesson,
    dashboard,
    error,
    join,
    openMaterial,
    publish,
    reloadDashboard,
    restore,
    session,
  };
}
