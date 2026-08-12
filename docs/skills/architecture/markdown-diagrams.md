---
id: markdown-diagrams
title: Markdown Diagrams
description: Web과 Local이 공유하는 안전한 Markdown Mermaid 렌더링과 편집 가능한 셀 작성 계약.
category: architecture
section: reference
order: 221
purpose: Web과 Local이 같은 Markdown 다이어그램 원문, 보안 경계, 디자인 토큰, 작성 동작을 쓰게 한다.
whenToUse: Markdown preview, Mermaid fence, 셀별 다이어그램 작성, SVG 보안 또는 다이어그램 성능을 바꿀 때.
---

# Markdown Diagrams

Codaro의 다이어그램은 새 셀 타입이나 별도 문서 포맷이 아니다. Percent Python의 Markdown 셀 안에 있는 fenced Mermaid 원문이 편집 가능한 단일 source of truth다. Web과 Local은 같은 editor build와 같은 렌더러를 사용하므로 별도 구현이나 별도 테마를 두지 않는다.

## 소유권

| 계약 | 기준 |
| --- | --- |
| 편집 및 저장 원문 | Percent Python Markdown 셀의 fenced `mermaid` block |
| Markdown 분해와 정화 | `editor/src/lib/markdownPreview.ts` |
| Mermaid 검증, 토큰 변환, SVG 정화 | `editor/src/lib/mermaidDiagram.ts` |
| 화면 상태와 viewport 지연 렌더링 | `editor/src/components/notebook/mermaidDiagram.tsx` |
| 명시적 셀 작성 동작 | `editor/src/lib/cellModel.ts`, `src/codaro/ai/conversation.py` |
| 색상, 글꼴, 표면, 테두리 | `assets/brand/designSystem/tokens.json`에서 생성된 Astryx CSS 변수 |
| 제품 검증 | `markdown-diagram` gate |

`diagram-design` 저장소는 정보 구조, 시각적 위계, 단순한 흐름 표현에 대한 참고 자료다. Codaro는 해당 저장소의 코드나 자산을 복사하지 않으며 별도 스타일 가이드를 만들지 않는다. 제품 토큰과 셀 계약이 계속 기준이다. 참고: <https://github.com/cathrynlavery/diagram-design>

## 렌더링 경계

렌더링 흐름은 다음 순서를 지킨다.

```text
Markdown 원문
  -> Marked로 HTML 구조 생성
  -> Mermaid fence를 typed segment로 분리
  -> 일반 HTML을 DOMPurify로 정화
  -> 보이는 위치의 Mermaid만 runtime 동적 로드
  -> strict 설정과 Astryx 토큰으로 SVG 생성
  -> SVG를 다시 DOMPurify로 정화
  -> 접근 가능한 figure로 표시
```

Markdown HTML과 Mermaid SVG는 서로 다른 신뢰 경계다. 일반 Markdown에서 `script`, `style`, `svg`, form 계열과 event handler를 허용하지 않는다. Mermaid에서는 셀별 초기화, HTML label, 클릭 동작, URL과 외부 리소스를 허용하지 않는다. 생성 SVG에서도 link, image, `foreignObject`, iframe, script와 외부 참조를 제거한다. 실패하면 원문을 잃지 않고 해당 figure 안에 오류를 표시한다.

## 작성 동작

렌더링은 자동이고 작성은 명시적이다. 사용자가 셀 메뉴의 `다이어그램` 동작을 누르거나 대화에서 다이어그램을 요청하면 다음 계약을 따른다.

1. `read-cells`로 대상 셀과 순서를 확인한다.
2. 대상이 Markdown이면 유용한 설명을 보존하고 fenced Mermaid block 하나를 갱신한다.
3. 다른 셀 유형이면 대상 바로 다음에 Markdown 셀을 삽입한다.
4. `write-cell`로 실제 문서에 반영한다.
5. `accTitle`, `accDescr`와 fence 밖의 짧은 글 요약을 포함한다.

채팅에 복사할 코드만 반환하는 것은 완료가 아니다. 자동 작성 결과도 일반 Markdown 원문이므로 사용자가 즉시 편집하고 diff를 검토할 수 있어야 한다.

## 품질 예산

한 Markdown 셀은 Mermaid 다이어그램을 최대 4개 표시한다. 다이어그램 하나는 원문 12,000자, 160줄, 줄당 160자, 노드 24개, 연결 40개 이하여야 한다. SVG는 `viewBox`를 유지하고 고정 폭과 높이를 제거해 셀 너비 안에서 반응형으로 표시한다.

Mermaid runtime은 일반 화면이나 화면 밖 다이어그램 때문에 초기 다운로드되지 않아야 한다. 다이어그램 figure가 viewport에 가까워진 뒤 3.5MB 이하의 전용 chunk 하나를 받는다. 공용 preload helper와 Markdown 정화 runtime은 전용 chunk에서 분리한다.

## 접근성과 테마

각 figure는 보이는 caption, SVG의 image role과 accessible name, screen reader가 읽을 수 있는 Mermaid 원문 대체 텍스트를 가진다. `accTitle`과 `accDescr`는 작성 계약에 포함한다.

다이어그램 색과 글꼴은 computed Astryx CSS 변수에서 읽는다. light, dark, accent 변경을 감지하면 같은 원문을 새 토큰으로 다시 렌더링한다. renderer 내부에 독립적인 브랜드 palette를 만들지 않는다.

## 범위

현재 제품 계약은 Mermaid가 표현하는 흐름도, 순서도, 상태도와 유사한 편집 가능한 Markdown 다이어그램이다. 임의 HTML 또는 임의 SVG renderer, 별도 rich-diagram 문서 모델, 디자인 토큰을 우회하는 자유 배치는 이 계약에 포함하지 않는다. 더 풍부한 renderer가 필요해지면 같은 Markdown 원문, 안전한 typed segment, Astryx 토큰, 접근성, 지연 로딩 경계를 유지한 별도 제안으로 검토한다.
