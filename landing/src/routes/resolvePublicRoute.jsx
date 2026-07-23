import { HomePage } from "../pages/home.jsx";
import { LearnPage } from "../pages/learn.jsx";
import { LessonPage } from "../pages/lesson.jsx";
import { findCurriculumLesson, parseLessonRoute } from "../lib/curriculumLessons.js";
import { homeMeta, learnMeta } from "../lib/publicMeta.js";
import { buildLearningResourceJsonLd } from "../lib/seo.js";
import { blogCategoryRoute, blogIndexRoute, blogPostRoute, blogSeriesRoute } from "./blogRoutes.jsx";
import { docsIndexRoute, docsPageRoute } from "./docsRoutes.jsx";
import { packsRoute } from "./packRoutes.jsx";
import { NotFoundPage } from "./routePrimitives.jsx";
import { searchRoute } from "./searchRoutes.jsx";
import { toolRoute, toolsRoute } from "./toolRoutes.jsx";

export function resolveRoute(path, routeData = null, search = "") {
  if (path === "/") {
    return {
      meta: homeMeta,
      element: <HomePage />,
    };
  }
  if (path === "/learn") {
    return {
      meta: learnMeta,
      element: <LearnPage />,
    };
  }
  const lessonRoute = parseLessonRoute(path);
  if (lessonRoute) {
    const lesson = findCurriculumLesson(lessonRoute.category, lessonRoute.contentId);
    if (!lesson) return notFoundRoute(path);
    const hydratedLesson = routeData?.kind === "public-lesson" ? routeData.lesson : null;
    const publicLesson = hydratedLesson || lesson;
    const requestedPathId = new URLSearchParams(search).get("path");
    const pathId = lesson.eligiblePathIds.includes(requestedPathId)
      ? requestedPathId
      : lesson.eligiblePathIds[0];
    return {
      meta: {
        title: publicLesson.seo?.title || lesson.title,
        description: publicLesson.seo?.description || lesson.direction || `${lesson.title} Python 공개 레슨`,
        url: lesson.route,
        type: "article",
        image: "/brand/codaro-og.png",
        imageAlt: `${publicLesson.title || lesson.title} Codaro 공개 레슨`,
        keywords: publicLesson.seo?.keywords || lesson.tags,
        jsonLd: publicLesson.seo ? buildLearningResourceJsonLd(publicLesson) : null,
      },
      element: (
        <LessonPage
          category={lessonRoute.category}
          contentId={lessonRoute.contentId}
          initialLesson={hydratedLesson}
          pathId={pathId}
        />
      ),
    };
  }
  if (path === "/docs") return docsIndexRoute();
  if (path === "/packs") return packsRoute();
  if (path === "/docs/blog") return blogIndexRoute();
  if (path.startsWith("/docs/blog/category/")) {
    return blogCategoryRoute(path.replace("/docs/blog/category/", ""));
  }
  if (path.startsWith("/docs/blog/series/")) {
    return blogSeriesRoute(path.replace("/docs/blog/series/", ""));
  }
  if (path.startsWith("/docs/blog/")) {
    return blogPostRoute(path.replace("/docs/blog/", ""));
  }
  if (path === "/search") return searchRoute();
  if (path === "/tools") return toolsRoute();
  if (path.startsWith("/tools/")) return toolRoute(path.replace("/tools/", ""));
  if (path.startsWith("/docs/")) {
    const initialContent = routeData?.kind === "docs-page" ? routeData.content : null;
    return docsPageRoute(path.replace("/docs/", ""), initialContent);
  }
  return notFoundRoute(path);
}

function notFoundRoute(path) {
  return {
    meta: {
      title: "페이지를 찾을 수 없음",
      description: "요청한 Codaro 페이지를 찾을 수 없습니다.",
      url: path,
    },
    element: <NotFoundPage />,
  };
}
