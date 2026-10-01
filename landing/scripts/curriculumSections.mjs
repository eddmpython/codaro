import { marked } from "marked";

const escape = value => String(value ?? "").replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const inline = value => marked.parseInline(escape(value));
const paragraph = value => value ? `<p>${inline(value)}</p>` : "";
const list = items => `<ul>${(items || []).map(item => `<li>${inline(item)}</li>`).join("")}</ul>`;
const caption = block => (block.title ? `<h3>${inline(block.title)}</h3>` : "") + paragraph(block.subtitle || block.description);
const group = item => `<h4>${inline(item.title)}</h4>${paragraph(item.subtitle)}${list(item.items)}`;

// 읽기 카드도 원고의 비교·정의·표를 생략하지 않는다. 실행 칸은 기존 Run이 맡는다.
function readingBlock(block) {
  const head = caption(block);
  switch (block.type) {
    case "table": return head + `<div class="lessonTable"><table><thead><tr>${(block.headers || []).map(h => `<th>${inline(h)}</th>`).join("")}</tr></thead><tbody>${(block.rows || []).map(row => `<tr>${row.map(cell => `<td>${inline(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
    case "note": return `<aside class="lessonTips">${head}${paragraph(block.content)}</aside>`;
    case "hero": return head + (block.points || []).map(p => `<h4>${inline(p.title)}</h4>${paragraph(p.description)}`).join("");
    case "stat": return head + list((block.items || []).map(item => `${item.value} · ${item.label}`));
    case "featureCards": return head + (block.cards || []).map(p => `<h4>${inline(p.title)}</h4>${paragraph(p.description)}`).join("");
    case "definition": return head + `<dl>${(block.items || []).map(p => `<dt><strong>${inline(p.term)}${p.english ? ` (${inline(p.english)})` : ""}</strong></dt><dd>${paragraph(p.meaning)}${paragraph(p.example)}</dd>`).join("")}</dl>`;
    case "conceptRow": return head + `<dl>${(block.rows || []).map(p => `<dt><strong>${inline(p.concept)}</strong></dt><dd>${paragraph(p.explain)}</dd>`).join("")}</dl>`;
    case "compare": return head + group(block.left) + group(block.right);
    case "doDont": return head + group(block.do) + group(block.dont);
    case "codeCompare": return head + [block.before, block.after].map(p => `<h4>${inline(p.label)}</h4><pre><code>${escape(p.code)}</code></pre>`).join("");
    case "terminal": return head + `<pre><code>${(block.lines || []).map(line => escape(line.cmd !== undefined ? `$ ${line.cmd}` : line.out)).join("\n")}</code></pre>`;
    case "anatomy": return head + `<pre><code>${escape(block.code)}</code></pre>` + list((block.parts || []).map(p => `${p.token} (${p.label}): ${p.explain}`));
    case "timeline": return head + `<ol>${(block.items || []).map(p => `<li><strong>${inline(p.title)}</strong>${paragraph(p.description)}</li>`).join("")}</ol>`;
    case "misconception": return head + (block.items || []).map(p => `<h4>${inline(p.myth)}</h4>${paragraph(p.truth)}`).join("");
    case "summary": return head + list(block.points);
    case "image": {
      // 이 정적 원본은 기존 Web Run 배포가 함께 제공한다. 앱 실행이나 설치는 필요하지 않다.
      const src = String(block.src || "");
      if (!/^\/curriculum\/[a-zA-Z0-9/_-]+\.(svg|png|webp|jpg)$/.test(src)) return "";
      return `<figure>${block.title ? `<h3>${inline(block.title)}</h3>` : ""}<img src="/codaro/run${src}" alt="${escape(block.title)}" loading="lazy" style="max-width:100%;height:auto"><figcaption>${inline(block.description)}</figcaption></figure>`;
    }
    default: return "";
  }
}

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
      const html = readingBlock(block);
      return html ? [{ type: "text", html }] : [];
    }),
  };
}
