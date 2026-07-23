import { Download, PackageOpen } from "lucide-react";
import { sharePacks } from "../lib/sharePacks.js";
import { PageHeader } from "./routePrimitives.jsx";

export function packsRoute() {
  return {
    meta: {
      title: "공유 팩",
      description: "Codaro 커리큘럼과 자동화 recipe를 내려받아 로컬에서 시작하는 공유 갤러리.",
      url: "/packs",
    },
    element: <PacksPage />,
  };
}

function PacksPage() {
  return (
    <main className="pageShell">
      <PageHeader
        eyebrow="Share packs"
        title="공유 팩 갤러리"
        copy="커리큘럼과 자동화 recipe를 manifest URL로 받아 Codaro 로컬 저장소에 설치합니다."
      />
      <section className="shareHowTo">
        <PackageOpen size={22} aria-hidden="true" />
        <div>
          <h2>로컬에서 시작하는 방법</h2>
          <p>
            Codaro 앱의 왼쪽 사이드바에서 공유 팩을 열고, 아래 `codaroPack.yaml` URL을 붙여넣은 뒤
            검사와 설치를 진행하세요. 설치된 커리큘럼은 나만의 커리큘럼으로 열리고, 자동화 recipe는 dry-run 태스크로 등록됩니다.
          </p>
        </div>
      </section>
      <div className="packGrid">
        {sharePacks.map((pack) => (
          <article className="packCard" key={`${pack.id}@${pack.version}`}>
            <div className="packCardHeader">
              <PackageOpen size={22} aria-hidden="true" />
              <span>{pack.version}</span>
            </div>
            <h2>{pack.title}</h2>
            <p>{pack.description}</p>
            <div className="packMeta">
              <span>커리큘럼 {pack.contents.curricula}</span>
              <span>자동화 {pack.contents.automations}</span>
              <span>{pack.license}</span>
            </div>
            <code>{pack.manifestUrl}</code>
            <div className="downloadActions">
              <a className="primaryButton" href={pack.manifestUrl}>
                manifest 열기
                <Download size={16} aria-hidden="true" />
              </a>
              <a className="secondaryButton" href={pack.packRootUrl}>
                파일 보기
              </a>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
