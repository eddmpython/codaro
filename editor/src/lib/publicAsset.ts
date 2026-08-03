export function resolvePublicAsset(path: string) {
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${basePath}${normalizedPath}`;
}

// 웹 앱은 랜딩 하위 경로(/…/run/)에 마운트된다. 랜딩 홈은 origin 루트가 아니라
// base에서 마지막 세그먼트(run)를 걷어낸 경로다. GitHub Pages 프로젝트 사이트처럼
// origin 루트가 우리 것이 아닌 배포에서 "/"로 보내면 안 된다.
export function resolveLandingHomePath(basePath: string = import.meta.env.BASE_URL || "/") {
  const trimmed = basePath.replace(/\/+$/, "");
  const lastSlash = trimmed.lastIndexOf("/");
  return lastSlash <= 0 ? "/" : `${trimmed.slice(0, lastSlash)}/`;
}
