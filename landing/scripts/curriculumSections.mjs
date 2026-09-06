import { marked } from "marked";

// 빌드 때 저장소가 소유한 교안만 읽는다. 사용자 입력은 이 경로에 들어오지 않는다.
export function sectionContent(section) {
  return {
    explanationHtml: marked.parse(String(section.explanation || "")),
    contentBlocks: (Array.isArray(section.blocks) ? section.blocks : []).flatMap((block) => {
      if (block.type === "image" && block.assetId) {
        return [{ type: "image", assetId: String(block.assetId), placement: String(block.placement || "") }];
      }
      if (block.type === "text" || block.type === "markdown") {
        return [{ type: "text", html: marked.parse(String(block.content || "")) }];
      }
      if (block.type === "list" && Array.isArray(block.items)) {
        return [{ type: "text", html: marked.parse(block.items.map((item) => `- ${String(item)}`).join("\n")) }];
      }
      return [];
    }),
  };
}
