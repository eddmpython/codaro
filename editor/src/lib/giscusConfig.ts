// Giscus(GitHub Discussions 기반 댓글) 설정.
// 레포에서 ① Discussions 활성화 ② giscus GitHub App 설치 ③ Discussion 카테고리 생성 후
// giscus.app 에서 발급되는 repoId / categoryId 를 아래에 채우면 레슨 하단 댓글이 활성화된다.
// 두 값이 비어 있으면(미설정) 댓글 영역은 렌더되지 않는다.
export const CODARO_GISCUS = {
  repo: "eddmpython/codaro",
  repoId: "R_kgDORmOR3A",
  category: "General",
  categoryId: "DIC_kwDORmOR3M4C460r",
} as const;

export function isGiscusConfigured(): boolean {
  return Boolean(CODARO_GISCUS.repoId && CODARO_GISCUS.categoryId);
}
