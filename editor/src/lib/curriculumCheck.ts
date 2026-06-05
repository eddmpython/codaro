import { codaroApi } from "@/lib/api";
import { recordAssignmentCheckEvent } from "@/lib/classroomEvents";
import type { CheckResult } from "@/types";

export type ExerciseCheckRequest = {
  sessionId: string;
  studentCode: string;
  expectedCode?: string;
  checkType?: string;
  variableName?: string;
  expectedValue?: string;
  requiredPatterns?: string[];
  hints?: string[];
  currentHintLevel?: number;
  category?: string;
  contentId?: string;
  sectionId?: string;
  prediction?: {
    expectedShape: string;
    expectedDtype: string;
    expectedValue: string;
    expectedError: string;
  } | null;
};

export async function runExerciseCheck(request: ExerciseCheckRequest): Promise<CheckResult> {
  const result = await codaroApi.checkExercise(request);
  try {
    await recordAssignmentCheckEvent(request, result);
  } catch (error) {
    console.warn("assignment check event record failed", error);
  }
  return result;
}
