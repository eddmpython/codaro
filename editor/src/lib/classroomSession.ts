export type ActiveAssignmentSession = {
  assignmentId: string;
  role: "student" | "tutor";
  title: string;
  joinCode?: string;
  tutorToken?: string;
  participantId?: string;
  participantToken?: string;
};

const ACTIVE_ASSIGNMENT_KEY = "codaro:active-assignment";

export function loadActiveAssignmentSession(): ActiveAssignmentSession | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(ACTIVE_ASSIGNMENT_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as ActiveAssignmentSession;
    if (!parsed.assignmentId) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveActiveAssignmentSession(session: ActiveAssignmentSession): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ACTIVE_ASSIGNMENT_KEY, JSON.stringify(session));
  window.dispatchEvent(new CustomEvent("codaro:assignment-session-updated", { detail: session }));
}

export function clearActiveAssignmentSession(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ACTIVE_ASSIGNMENT_KEY);
  window.dispatchEvent(new CustomEvent("codaro:assignment-session-updated"));
}
