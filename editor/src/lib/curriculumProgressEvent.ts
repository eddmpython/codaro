export const PROGRESS_UPDATED_EVENT = "codaro:progress-updated";

export function notifyCurriculumProgressUpdated() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(PROGRESS_UPDATED_EVENT));
  }
}
