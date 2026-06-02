import { codaroApi } from "@/lib/api";
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
  return codaroApi.checkExercise(request);
}
