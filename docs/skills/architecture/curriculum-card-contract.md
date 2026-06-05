---
id: curriculum-card-contract
title: Curriculum Card Contract
description: 커리큘럼 YAML sections[].blocks[]의 블록 type → displayKind/role/필수키 단일 계약(SSOT).
category: architecture
section: reference
order: 210
purpose: 학습 카드 블록의 허용 type과 필수 키를 한 곳에 못박아, type 오타가 조용히 prose로 fallback되는 사고를 막는다.
whenToUse: 새 학습 카드(블록 type)를 추가하거나, 카드 YAML 키를 바꾸거나, 프론트 렌더 분기를 고칠 때.
---

# Curriculum Card Contract

<!-- SSOT: 코드(`src/codaro/curriculum/cardContract.py`의 CARD_REGISTRY)가 기준이고, 이 문서는 미러다.
     게이트 `tests/verifyCardContract.py`가 전 커리큘럼을 walk해 둘의 드리프트·type 오타·필수키 누락을 차단한다. -->

커리큘럼 YAML의 `sections[].blocks[]`는 `converter.py`가 `displayKind`로 바꿔 프론트
(`editor/src/components/curriculum/curriculumMarkdownBody.tsx`)가 렌더한다. 같은 변환을
번들 빌드용으로 `editor/src/lib/curriculaRegistry.ts`가 미러한다.

## 기준 파일 (이 순서로 본다)

| 기준 | 파일 | 역할 |
|---|---|---|
| 카드 계약 SSOT(코드) | `src/codaro/curriculum/cardContract.py` | 허용 type·displayKind·role·필수키 단일 레지스트리 |
| 계약 게이트 | `tests/verifyCardContract.py` | 전 YAML walk, type 오타·필수키 누락 차단(quality-cycle 편입) |
| 서버 변환 | `src/codaro/curriculum/converter.py` | `_convertBlock`이 type→BlockConfig(displayKind/role/payload) |
| 번들 변환(미러) | `editor/src/lib/curriculaRegistry.ts` | 브라우저에서 같은 변환을 수행 |
| 프론트 렌더 | `editor/src/components/curriculum/curriculumMarkdownBody.tsx` | `displayKind`로 카드 컴포넌트 디스패치 |
| displayKind 유니온 | `editor/src/lib/cellSchema.ts` `cellDisplayKinds` | 프론트 displayKind 타입 SSOT |

## 규약

- 블록 `type`은 **camelCase canonical**. 미등록 type은 게이트가 에러로 막는다(조용한 prose fallback 금지).
- **선택/미지 키는 자유 패스스루** — 작성 유연성과 converter의 관용적 폴백을 보존한다. full pydantic 강검증은 하지 않는다.
- 새 카드 추가 = (1) `cardContract.py` `CARD_REGISTRY`에 1줄, (2) `converter.py`·`curriculaRegistry.ts`에 변환 분기, (3) 프론트 `curriculumMarkdownBody.tsx`에 displayKind 분기, (4) `cellSchema.ts`에 displayKind 리터럴, (5) 이 문서 표에 1행. 게이트가 (1)↔(5) 누락을 잡는다.

## 블록 type 표

필수키는 OR-그룹(그 중 하나 이상이 비어있지 않으면 통과). 빈 칸은 type allowlist 검사만 한다.

| type | displayKind | role | 필수키(OR) | 주요 선택키 | 렌더 |
|---|---|---|---|---|---|
| `mainHeader` / `sectionHeader` / `sectionTitle` | title | title | — | title, subtitle, description | 제목 박스 |
| `hero` | hero | visual | — | title, subtitle, description, points[] | 배너 + 포인트 격자 |
| `localWorkbench`(별칭 `localRunner`) / `tiobeIndex` | hero | visual | — | title, description | 특수 히어로 |
| `featureCards` / `choiceCards` / `threeColumnCards` | cardGrid | visual | cards \| items | title, subtitle, cards[].{emoji,title,description} | 2열 카드 그리드 |
| `resourceCards` | resource | explanation | cards \| items \| resources | cards[].{emoji,title,url,stats} | 자료 카드 |
| `stepCard` / `practiceCard` | practice | exercise | cards \| items \| steps | code, footer | 단계/실습 카드 |
| `compare` / `fullWidthComparison` | comparison | visual | cards \| left \| right \| items | left/right.{title,subtitle,icon,items[]} | 좌우/3열 비교 |
| `table` | table | visual | rows \| items \| data \| headers | headers[], rows[][] | 표 |
| `image` | media | visual | src \| url \| href \| imageUrl | title, description | `<img>`(png/jpg/gif/webp/svg) |
| `video` | media | visual | src \| url \| href \| videoUrl \| items | title, description | 인라인 `<video>`(mp4/webm/mov) |
| `youtube` | media | visual | youtube \| youtubeId \| videoId \| src \| url | title | youtube-nocookie iframe |
| `videoCarousel` / `pdf` / `MIME` | media | visual | items / src / — | title | 미디어 자료 |
| `link` / `links` / `linkButtons` | resource | explanation | url\|href\|items\|links / items\|links / items\|links\|buttons | title, description | 링크 카드 |
| `tip` / `tipCard` / `note` / `info` | callout | explanation | content \| title \| description \| items | style | 컬러 callout |
| `warning` | callout | check | content \| title \| description \| items | style | 경고 callout |
| `codeDescription` | callout | explanation | content \| code \| description | — | 코드 설명 callout |
| `quiz` | quiz | check | question \| title | options[] | 문제 + 선택지 |
| `expansion` | practice | exercise | — | blocks[], code, hints[] | 실습(연습) — 채점 동결 |
| `code` | code | snippet | — | language | 코드 셀 |
| `list` | prose | learning | items | style(bullet\|number\|check) | 목록/체크리스트 |
| `centerText` | centerText | learning | — | title, content | 중앙 정렬 텍스트 |
| `text`(기본) | prose | learning | — | content | 마크다운 prose |
| `conceptRow` | conceptRow | visual | rows | title, rows[].{concept,explain,emoji,image,accent} | 개념↔비유 좌우 병치(수평 설명카드) |

## 수평 설명카드 (`conceptRow`)

개념(좌) ↔ 비유/예시 + 선택 이미지(우)를 한 행에 좌우 병치하고 행을 세로로 쌓는다.
학습과학 근거: 공간 인접(split-attention 제거) + 듀얼코딩 + 기지개념 anchoring.

```yaml
- type: conceptRow
  title: GitHub 개념 ↔ 일상 비유
  description: 낯선 용어를 이미 아는 것에 붙인다   # 선택
  rows:                                          # 필수, 2~4행 권장
    - emoji: "📦"                                # 선택
      concept: 저장소(Repository)                # 필수
      explain: 프로젝트 전용 폴더 한 개           # 필수(권장)
      image: /curriculum/devTools/repo.svg       # 선택, 상대 경로 자산
      accent: cyan                               # 선택, 토큰만: cyan|amber|emerald|rose|sky
```

데스크톱은 좌우 병치(`md:grid-cols-[1fr_1.4fr]`), 모바일은 1열로 폴백한다.
`accent`는 자유 색상값이 아니라 위 토큰만 허용한다(색상 난립 방지).

## 미디어 키 정규화

`image`/`video`/`youtube`는 소스 키 alias를 폭넓게 받지만(작성 호환), 신규 작성은
canonical을 쓴다: 파일 소스 `src`, youtube는 `youtubeId`(또는 watch/embed URL). 외부
hotlink는 깨짐·라이선스·방화벽 위험이 있으니 **자체 자산을 `editor/public/` 상대 경로로**
두는 것을 권장한다(예: `/curriculum/<category>/<name>.svg`).
