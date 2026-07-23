import { Boxes } from "lucide-react";
import { tools } from "../lib/tools/registry.js";
import { appPath } from "../lib/publicRouting.js";
import { NotFoundPage, PageHeader } from "./routePrimitives.jsx";

function groupBy(items, key) {
  return items.reduce((groups, item) => {
    const group = item[key] || "기타";
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {});
}

export function toolsRoute() {
  return {
    meta: {
      title: "도구",
      description: "Codaro 공개 사이트의 브라우저 도구 모음.",
      url: "/tools",
    },
    element: <ToolsPage />,
  };
}

function ToolsPage() {
  const groups = groupBy(tools, "category");
  return (
    <main className="pageShell">
      <PageHeader eyebrow="Tools" title="브라우저 도구" copy="공개 사이트에서 함께 제공하는 작은 유틸리티 목록." />
      <div className="toolGroups">
        {Object.entries(groups).map(([category, group]) => (
          <section key={category}>
            <h2>{category}</h2>
            <div className="toolGrid">
              {group.map((tool) => (
                <a className="toolCard" href={appPath(`/tools/${tool.slug}`)} key={tool.slug}>
                  <span>{tool.icon}</span>
                  <strong>{tool.title}</strong>
                  <p>{tool.description}</p>
                </a>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}

export function toolRoute(slug) {
  const tool = tools.find((candidate) => candidate.slug === slug);
  if (!tool) {
    return {
      meta: { title: "도구를 찾을 수 없음", description: "요청한 도구를 찾을 수 없습니다.", url: `/tools/${slug}` },
      element: <NotFoundPage />,
    };
  }
  return {
    meta: { title: tool.title, description: tool.description, url: `/tools/${tool.slug}` },
    element: <ToolDetailPage tool={tool} />,
  };
}

function ToolDetailPage({ tool }) {
  return (
    <main className="pageShell narrow">
      <PageHeader eyebrow={tool.category} title={tool.title} copy={tool.description} />
      <section className="toolDetail">
        <Boxes size={28} aria-hidden="true" />
        <h2>React 전환 기준 도구 표면</h2>
        <p>
          이 경로는 React 기반 GitHub Pages 라우트로 유지된다. 개별 도구의 고급 상호작용은
          공개 사이트 도구 표면의 다음 개선 단위로 붙일 수 있게 URL과 메타데이터를 보존했다.
        </p>
        <div className="tagRow">
          {tool.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      </section>
    </main>
  );
}
