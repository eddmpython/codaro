import { registryLessonProgressContract } from "@/lib/curriculaRegistry";
import {
  projectCanonicalCurriculumLearning,
  type CanonicalCurriculumLearningProjection,
} from "@/lib/curriculumLearningProjection";
import { readLearningEvidenceEvents } from "@/lib/learningEvidenceOperations";

export async function loadCanonicalCurriculumLearningState(
  asOf: string | Date = new Date(),
): Promise<CanonicalCurriculumLearningProjection> {
  const evidenceEvents = await readLearningEvidenceEvents();
  const lessonRefs = [...new Set(evidenceEvents.map((event) => event.lessonRef))];
  const resolved = await Promise.all(lessonRefs.map(async (evidenceLessonRef) => {
    const lessonRef = evidenceLessonRef;
    const separator = lessonRef.indexOf("/");
    if (separator < 1 || separator !== lessonRef.lastIndexOf("/")) return null;
    const contract = await registryLessonProgressContract(
      lessonRef.slice(0, separator),
      lessonRef.slice(separator + 1),
    );
    return contract ? { contract, evidenceLessonRef } : null;
  }));
  const contractsByCanonicalRef = new Map<string, NonNullable<(typeof resolved)[number]>["contract"]>();
  for (const item of resolved) {
    if (!item) continue;
    const current = contractsByCanonicalRef.get(item.contract.lessonRef);
    const evidenceLessonRefs = [...new Set([
      ...(current?.evidenceLessonRefs ?? []),
      item.evidenceLessonRef,
    ])];
    contractsByCanonicalRef.set(item.contract.lessonRef, {
      ...(current ?? item.contract),
      evidenceLessonRefs,
    });
  }
  return projectCanonicalCurriculumLearning(
    evidenceEvents,
    contractsByCanonicalRef.values(),
    { asOf },
  );
}
