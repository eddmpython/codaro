import { ArrowRight } from "lucide-react";
import { appPath } from "../lib/publicRouting.js";

export function PageHeader({ eyebrow, title, copy }) {
  return (
    <header className="pageHeader">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p>{copy}</p>
    </header>
  );
}

export function HTMLContent({ html }) {
  return <div className="htmlContent" dangerouslySetInnerHTML={{ __html: html }} />;
}

export function NotFoundPage() {
  return (
    <main className="pageShell narrow">
      <PageHeader eyebrow="404" title="페이지를 찾을 수 없습니다" copy="경로가 바뀌었거나 아직 공개되지 않은 페이지입니다." />
      <a className="primaryButton" href={appPath("/")}>
        홈으로 이동
        <ArrowRight size={16} aria-hidden="true" />
      </a>
    </main>
  );
}
