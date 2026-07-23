function compactText(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function truncateText(value, maxLength) {
  const text = compactText(value);
  if (text.length <= maxLength) return text;
  const candidate = text.slice(0, Math.max(0, maxLength - 3));
  const lastSpace = candidate.lastIndexOf(" ");
  const boundary = lastSpace >= Math.floor(maxLength * 0.65) ? lastSpace : candidate.length;
  return `${candidate.slice(0, boundary).trimEnd()}...`;
}

function compactList(value) {
  return Array.isArray(value) ? value.map(compactText).filter(Boolean) : [];
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

export function lessonRef(lesson) {
  return `${compactText(lesson?.track)}/${compactText(lesson?.id)}`;
}

export function runtimeLabel(runtimeTier) {
  return runtimeTier === "browser" ? "Web" : "Local";
}

export function learningPathLabel(lesson) {
  return compactList(lesson?.eligiblePathIds).join(", ");
}

export function summarizeLessonBody(lesson, maxLength = 2800) {
  const intro = unique([
    lesson?.intro?.direction,
    ...compactList(lesson?.intro?.benefits),
    ...compactList(lesson?.intro?.points),
  ]).map((value) => truncateText(value, 260));

  const sections = Array.isArray(lesson?.sections) ? lesson.sections : [];
  const sectionSummaries = sections.map((section) => {
    const exercise = section?.exercise && typeof section.exercise === "object" ? section.exercise : {};
    const details = unique([
      section?.subtitle,
      section?.goal,
      section?.why,
      section?.explanation,
      ...compactList(section?.tips),
      exercise.prompt,
      ...compactList(exercise.hints),
    ]);
    const heading = compactText(section?.title);
    const body = truncateText(details.join(" "), 240);
    return [heading, body].filter(Boolean).join(": ");
  }).filter(Boolean);

  const summary = unique([...intro, ...sectionSummaries]).join(" ");
  return truncateText(summary || lesson?.seo?.description || lesson?.direction || lesson?.title, maxLength);
}

export function toLessonSearchEntry(lesson) {
  const canonicalRef = lessonRef(lesson);
  const summary = summarizeLessonBody(lesson, 360);
  const outcomes = compactList(lesson?.outcome);
  const prerequisites = compactList(lesson?.prerequisites);
  const eligiblePathIds = compactList(lesson?.eligiblePathIds);
  const sections = Array.isArray(lesson?.sections) ? lesson.sections : [];
  const lessonConcepts = unique([
    lesson?.direction,
    ...compactList(lesson?.intro?.benefits),
    ...compactList(lesson?.intro?.points),
    ...sections.flatMap((section) => [
      section?.title,
      section?.subtitle,
      truncateText(section?.goal, 100),
    ]),
  ]);
  const keywords = unique([
    ...compactList(lesson?.tags),
    ...compactList(lesson?.seo?.keywords),
    ...outcomes,
    ...prerequisites,
    ...eligiblePathIds,
    lesson?.runtimeTier,
    runtimeLabel(lesson?.runtimeTier),
    canonicalRef,
  ]);
  return {
    kind: "lesson",
    title: compactText(lesson?.title),
    description: compactText(lesson?.seo?.description || lesson?.direction || `${lesson?.title} Python 레슨`),
    url: compactText(lesson?.route),
    text: truncateText(unique([...lessonConcepts, ...keywords]).join(" "), 1600),
    summary,
    category: compactText(lesson?.track),
    contentId: compactText(lesson?.id),
    lessonRef: canonicalRef,
    domain: compactText(lesson?.domain),
    domainLabel: compactText(lesson?.domainLabel),
    runtimeTier: lesson?.runtimeTier,
    eligiblePathIds,
    estimatedMinutes: Number(lesson?.estimatedMinutes) || 0,
    outcomes,
    prerequisites,
  };
}
