# 19. Web Service Build - astryx 프런트 + 브라우저 서빙 정공법 구현

상태: 설계 v0.1 + 착수 (2026-07-11). 목표(사용자 goal): codaro-anywhere를 정공법으로 실제 서비스로 완성한다. 웹 디자인은 React + astryx(https://astryx.atmeta.com), 기존 GitHub Pages는 갈아엎어도 좋다. 랜딩·학습 페이지를 새로 설계하고, 브랜딩하고, 서비스를 완성한다. 로컬 디자인도 필요하면 웹에 맞춘다.

이 문서는 doc 14(아키텍처 종합)의 구현 계획이다. 서빙 원리는 14, 여기는 "무엇을 어떤 순서로 짓나".

---

## 0. 한 줄

**React+astryx로 랜딩·학습 웹을 새로 짓고, pyproc(브라우저 파이썬 런타임) 위에서 codaro FastAPI 백엔드를 브라우저에서 서빙(Service Worker + ASGI)해서, 설치 없이 웹에서 codaro를 그대로 쓰게 만든다. GitHub Pages를 이 새 프런트로 교체한다.**

## 1. 스택 결정 (근거 있는 확정)

- **웹 디자인 = React 19 + astryx.** `@astryxdesign/core@0.1.4` + `@astryxdesign/theme-*` + `@astryxdesign/cli`. peer = `react>=19`, `@stylexjs/stylex@^0.18.3`. 컴포넌트가 사전 컴파일(CSS 캐스케이드 레이어 + 토큰)이라 별도 빌드 플러그인 불필요. 커스텀 스타일만 `stylex.create()`. landing/editor 둘 다 React 19라 충돌 없음.
- **프런트 위치 = `landing/`을 astryx로 갈아엎는다.** 기존 Pages 파이프라인(pages.yml -> landing build -> deploy)과 brand sync/prerender 스크립트를 재사용한다. 새 앱 루트를 만들지 않아 repository-structure 게이트 충돌을 피한다. 홈=랜딩, 새 라우트 `/learn`=학습, 이후 `/app`=anywhere 서빙 표면.
- **런타임 = pyproc(사용자 소유 레포, SHA 핀 소비).** PyodideEngine이 `pyproc.boot()` + `AsgiServer`로 codaro FastAPI 앱을 브라우저에서 구동한다. pyproc이 런타임, codaro가 앱, 웹 transport shim이 접착제.

## 2. 서빙 아키텍처 (doc 14 구현, "그대로 서비스")

codaro는 이미 정적 프런트(webBuild) + FastAPI(ASGI) 백엔드 + 상대경로 `/api/*` fetch 구조라, transport만 갈아끼우면 domain/engine/프런트가 안 바뀐다.

```
지금:  브라우저 --HTTP/WS--> uvicorn --> FastAPI app --> engine/domain (로컬)
웹:    브라우저 --fetch--> Service Worker --> (같은 FastAPI app, pyproc/Pyodide 안) --> engine/domain
```

- **그대로 가는 것**: 프런트 fetch, FastAPI 라우터 조립(create*Router), domain(curriculum/ai/share), engine document/kernel.
- **얇은 웹 transport shim(신규)**:
  1. 백엔드 호스트 스왑: `uvicorn.run` 대신 pyproc `AsgiServer`로 같은 `app`을 브라우저에서 구동.
  2. Service Worker = 새 uvicorn: `/api/*` fetch를 ASGI scope로 변환->앱 호출->Response.
  3. WebSocket 2개(kernel 실행 스트리밍, terminal PTY): kernel은 WS 폴리필(같은 브라우저 워커로 MessageChannel 연결, 프런트 as-is) 또는 SSE 전환. terminal은 pyproc 서버리스 셸/로컬 강등.
  4. 영속 스왑: 파일 I/O -> IndexedDB/OPFS 어댑터(system/ 층).
  5. OS 의존 모듈 가드: automation/terminal/system의 OS 부분을 lazy-import/브라우저 어댑터로(Pyodide import 오염 방지).
- **정직한 등급**: 커리큘럼/채팅/에디터/노트북=웹 완전, 터미널(PTY)=강등, 자동화(상주 스케줄)=로컬 전용. capability router가 tierUsed 배지로 표면화.

## 3. astryx 통합

- `landing/`에 `@astryxdesign/core @astryxdesign/theme-neutral @astryxdesign/cli @stylexjs/stylex` 설치.
- 전역 CSS에 `@astryxdesign/core/reset.css` + `astryx.css` + 테마 `theme.css` import. 기존 `styles.css`의 캐스케이드 레이어 순서 정리.
- 컴포넌트는 서브패스 진입점(`@astryxdesign/core/Button`, `.../Layout`)에서.
- 브랜딩은 astryx 테마 토큰 위에 Codaro 브랜드 오버라이드(색/반지름/폰트)를 CSS custom property로 얹는다. zinc 계열 -> astryx neutral 테마 매핑.

## 4. 랜딩 페이지 설계 (새로)

- 히어로: "코드가 인터페이스가 되는 개인 자동화 스튜디오" + "설치 없이 브라우저에서 바로" CTA(웹 학습 시작) + "로컬로 완전하게" CTA(런처 다운로드).
- 4 표면 소개(채팅/에디터/커리큘럼/자동화)를 astryx 카드로.
- "브라우저에서 진짜 파이썬" 실증 섹션: pyproc 런타임 자랑(프로세스/병렬/복원) + tierUsed 정직성.
- 커리큘럼 미리보기 -> `/learn` 유도.
- 정직한 등급표(웹 완전 vs 로컬 전용).

## 5. 학습 페이지 설계 (새로)

- `/learn`: 커리큘럼 카테고리 트리 -> 레슨. 콘텐츠는 정적(curricula/python SSOT를 빌드시 주입 또는 fetch).
- 레슨 실행: PyodideEngine(pyproc) 위에서 셀 실행/채점. 초기엔 순수 파이썬 레슨(84% 브라우저권).
- 학습 카드 흐름(설명->실행->검증->변주)을 astryx로 재구성. 로컬 editor의 curriculumSurface와 데이터 계약 공유, 표면만 astryx.

## 6. GitHub Pages 갈아엎기

- 기존 landing 홈을 astryx 홈으로 교체. pages.yml 그대로(landing build). base path `/codaro/` 유지 또는 커스텀 도메인 검토.
- COOP/COEP: Pages는 커스텀 헤더 불가 -> SharedArrayBuffer 필요한 학습 실행 표면은 Cloudflare Pages(`_headers`)로 이전 검토(doc 02 §5). 랜딩 정적은 GH Pages 유지 가능.

## 7. 브랜딩

- 정체성: programmable studio, "코드가 인터페이스". 마스코트 source=assets/brand/mascot. 한국어 기본.
- astryx neutral 테마 + Codaro accent(zinc 기반)로 톤 통일. 로고/파비콘은 기존 자산 재사용, 필요시 astryx 톤에 맞춰 재크롭.

## 8. Phasing (구현 순서)

- **P0 [완료]** (`1e23c1ca`): 설계 문서 + astryx 툴체인 실증(설치, 빌드 95모듈, SSR 검증).
- **P1a [완료]** (`52c468d8`): 랜딩 홈을 React SSR 단일 SSOT로 전환(수기 homeBody 두 SSOT 지뢰 제거, Vite ssrLoadModule).
- **P1b [완료]** (`0e16d800`): 랜딩 홈 astryx 재설계(Heading/Text/Button/Card/Badge + codaro anywhere 섹션 + 정직한 등급표).
- **P1c [완료]** (`ef11f2ff`): Codaro amber accent 브랜드 토큰 + astryx light-dark를 data-theme에 동기화 + 홈 실행기 데모.
- **P2 [완료]** (`d96a2156`): `/learn` 학습 페이지 - 커리큘럼 생성기(generateCurriculum.js, curricula/python SSOT -> 8도메인 472레슨) + astryx 트리 렌더 + 라우팅/내비/prerender.
- **P3 [완료]** (`91978888`): 브라우저 Python 실행기(pyproc SHA 핀 소비, 클릭 시 lazy boot+runAsync). 단일 런타임은 SAB/COOP-COEP 불요라 GH Pages에서 동작.
- **P3.5 [완료]** (`7241e9e2`): 레슨 클릭 실행 - 생성기가 레슨별 첫 스니펫 추출(467/472), 카드 클릭 시 코드를 실행기로 로드. 472레슨이 브라우저에서 진짜 실행.
- **P4 [다음]**: SW + AsgiServer로 codaro FastAPI 브라우저 서빙(browser-as-server), `/api/*` 라우팅. codaro 백엔드의 Pyodide 임포트 호환성(automation/system OS 의존 lazy화)이 착수 전 조사 대상.
- **P5**: WS 어댑터(kernel), 영속(IndexedDB), capability router 배지, COOP/COEP 호스팅 이전(Cloudflare Pages).
- **P6**: 로컬 editor 디자인을 웹 astryx 톤에 정합(필요분만), 서비스 완성.

### 진행 메모 (2026-07-11~12)
- 실측 검증은 전부 **빌드 정합**(vite build + prerender SSR + 전체 npm run build, 83 routes) 수준. 브라우저 실동작(Pyodide 다운로드+실행)은 배포본에서 확인 예정(pyproc boot() 패턴은 pyproc 레포에서 기검증).
- CSP 없음 확인 -> jsdelivr Pyodide 로드가 배포본에서 막히지 않음.
- 생성물(src/lib/generated) 중 curriculum.js만 이 이니셔티브 소유, 나머지(docsNav/posts/searchIndex)는 빌드 부산물이라 커밋에서 제외(revert).

## 9. 롤백

- 각 P는 독립 커밋. landing 빌드가 깨지면 Pages 배포 실패 -> 커밋 전 `landing npm run build` green 필수(preflight 밖 게이트).
- astryx 통합이 실패하면 P0에서 중단(현 landing 유지). 서빙(P3+)이 막히면 P2까지의 정적 학습 웹은 독립적으로 서비스 가능.

## 10. 평가 (개발자 + PM 이중 렌즈)

- **개발자**: 가장 큰 리스크는 P4(FastAPI 브라우저 구동 시 OS 의존 import 오염)와 WS 2개. 나머지는 층 경계 덕에 저위험. astryx 0.1.4는 초기 버전이라 컴포넌트 공백 가능 -> 커스텀 stylex로 보완.
- **PM**: P2까지만 해도 "설치 없이 브라우저에서 배우는 codaro"라는 시장성 있는 표면이 선다. 서빙(P3+)은 그 위 심화. 정직한 등급 표면화가 신뢰의 핵심(과장 금지).
