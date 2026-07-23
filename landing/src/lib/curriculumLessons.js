import { curriculumLessons } from "./generated/curriculum.js";

const lessonModules = import.meta.glob("./generated/curriculumLessons/*.js");

export function findCurriculumLesson(category, contentId) {
  return curriculumLessons.find((lesson) => lesson.track === category && lesson.id === contentId) || null;
}

export async function loadCurriculumLesson(category, contentId) {
  const lesson = findCurriculumLesson(category, contentId);
  if (!lesson) return null;
  const modulePath = `./generated/curriculumLessons/${lesson.contentModule}.js`;
  const load = lessonModules[modulePath];
  if (!load) throw new Error(`공개 레슨 모듈을 찾을 수 없습니다: ${category}/${contentId}`);
  const loaded = await load();
  return loaded.default;
}

export function parseLessonRoute(path) {
  const match = /^\/learn\/lesson\/([^/]+)\/([^/]+)$/.exec(path);
  if (!match) return null;
  try {
    return {
      category: decodeURIComponent(match[1]),
      contentId: decodeURIComponent(match[2]),
    };
  } catch {
    return null;
  }
}
