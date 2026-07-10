# 02. Entry And Bootstrap - 진입 UX, 파일 마운트, 포터블 런타임, 호스팅 배선

상태: 상세 설계 v0.1 (2026-07-10)
범위: 웹 표면 진입에서 로컬 승격까지의 전 경로. Chromium FSA, 임베디드 CPython 부트스트랩, localhost 연결(PNA/CORS), 호스팅 결정.

---

## 1. 진입 UX 스토리 (설치 0초에서 로컬급까지)

1. 사용자가 무료 웹 표면을 연다(정적, 로그인 없음). 커리큘럼과 에디터가 뜬다.
2. 기초·pandas권 셀은 브라우저에서 즉시 실행된다(PyodideEngine). 첫 실행 전 "브라우저 실행 준비 중"(Pyodide 로드, 코어 약 6.4MB + pandas권 수십 MB, 이후 브라우저 캐시) 표시.
3. 진짜 파일로 실습하고 싶으면 "내 폴더 열기"로 폴더 권한을 준다(Chromium/Edge). 브라우저 파이썬이 그 폴더 위에서 읽고 쓴다.
4. 네이티브 휠·OS 능력 셀을 만나면 배지와 함께 "로컬 연결" 버튼. 로컬 엔진이 이미 떠 있으면 이 단계가 자동으로 스킵되고 연결된다.
5. 로컬이 없으면 버튼이 포터블 번들을 내려준다. 더블클릭 1회 -> 트레이 상주 -> 페이지가 자동 감지·연결 -> 같은 탭이 그대로 로컬급이 된다. 목표: 4~5단계 합계 5분 이내(북극성 firstRunTimeToValue와 동형).

원칙: 이 흐름 어디에도 가짜 실행이 없다. 실행 불가면 실행 불가라고 보인다.

## 2. 브라우저 지원 정책

- 웹 티어 전체 기능 = Chromium/Edge 한정(File System Access API 전제). Firefox/Safari = 가상 FS 모드 + "로컬 연결" 안내를 기본 동선으로.
- 이 제한은 데모·보조 티어라서 감수 가능하다는 결정(2026-07-10). 전 브라우저 동등 지원은 non-goal([05](05-killlist-and-non-goals.md)).

## 3. 파일 마운트 (웹 티어의 ② 회복)

- Chromium showDirectoryPicker로 디렉터리 핸들 획득 -> Pyodide FS에 마운트(mountNativeFS 계열 API). 이후 open()·pandas.read_csv가 진짜 사용자 파일을 읽고 쓴다.
- 권한 지속성: 핸들은 IndexedDB에 보관하고 재방문 시 재승인 요청. 권한 UI 문구는 "이 폴더 안에서만"임을 명시.
- 경계: 마운트 폴더 밖 접근은 가상 FS로 남는다. 라우터 배지가 어느 파일계에 썼는지 표시(일관성 계약, [01 §4](01-tier-architecture.md)).
- census 확정(2026-07-10, Pyodide 314.0.2 소스 확인): API는 `mountNativeFS(path, FileSystemDirectoryHandle)`(Experimental), picker(showDirectoryPicker)는 메인 스레드 전용이나 핸들은 postMessage로 Worker에 전달 가능 - 본 설계의 "메인에서 권한, Worker에서 마운트" 패턴 성립. 쓰기는 `syncfs()` 수동 호출 필수. 구현이 MEMFS 사본 기반이라 대용량 폴더는 메모리·동기화 비용에 비례 - 대용량 벤치는 Phase 1 항목. Chrome 122+ 영구 권한("모든 방문에 허용")으로 재승인 UX 완화.

## 4. localhost 연결 배선 (웹 표면 -> 로컬 엔진)

기존 배선(조사 실증)과 추가분:

| 항목 | 현재 | 필요 작업 |
|---|---|---|
| API base 주입 | VITE_CODARO_API_BASE 지원(editor/src/lib/api.ts:71) | 정적 빌드에서 127.0.0.1:8765 기본 후보 + 상태 프로브 |
| CORS | localhost 계열 + CODARO_DEV_ORIGINS(src/codaro/server.py:263-282) | 웹 표면 오리진(Pages 도메인) 허용 추가 |
| LNA 권한 | 없음 | census(2026-07-10) 확정: PNA(서버 preflight 헤더 opt-in)는 폐기됐고 Local Network Access **사용자 권한 프롬프트** 모델로 대체됨. Chrome 142+에서 fetch/XHR, 147+에서 WebSocket까지 게이트. 서버 측 특수 헤더는 불요(일반 CORS만 필요), 페이지는 HTTPS(secure context) 필수, 필요 시 fetch에 targetAddressSpace: "loopback" 선언. 프론트가 권한 거부 상태를 감지해 안내 UI로 착지시킨다 |
| 터미널 WS | window.location.host 하드코딩(editor/src/components/terminal/terminalPanel.tsx:71) | 설정 API base 준수로 수정 + LNA 프롬프트(147+) 이후 재연결 처리 |
| SPA 경로 | 에디터 vite base "/" + PWA 절대경로 전제 | 웹 표면 빌드 변형에서 base 파라미터화 + SW 캐시 경로 정리 |

- 브라우저별 현행(census): Edge는 Chromium 동반(147 동일), Firefox도 자체 LNA 출하 진행(150+ 정책 존재, 세부 상이 - 실기기 확인 항목), Safari는 LNA 없음(단 HTTPS -> http://127.0.0.1 mixed content 동작은 별도 확인 필요).

- 감지 프로토콜: 페이지 로드 시 GET /api/health를 127.0.0.1:8765로 프로브(짧은 타임아웃). 성공 시 "로컬 연결됨" 배지 + 라우터 규칙 1(전 셀 local) 활성.
- 보안: 로컬 엔진은 원래 무인증 로컬 전용이었다. 웹 오리진에서 접속을 여는 순간 오리진 allowlist + 최초 1회 페어링 승인(트레이 알림에서 허용)을 요구한다. 상세 위협 모델은 [03 §3](03-remote-access-p2p.md)과 공유.

## 5. 호스팅 결정: Cloudflare Pages

| 기준 | GitHub Pages | Cloudflare Pages |
|---|---|---|
| 대역폭 | 월 100GB 소프트 리밋 | 사실상 무제한 (2026-07 조사) |
| 커스텀 헤더 | 불가 | _headers 파일로 가능 -> COOP/COEP -> SharedArrayBuffer 인터럽트 |
| 파일 한도 | 리포 1GB 권장 | 파일 20,000개·단일 25MiB(대형 wheel은 공식 CDN 참조로 회피) |

- 결정: 웹 표면(에디터 정적 변형)은 Cloudflare Pages. 기존 landing(GitHub Pages, pages.yml, base /codaro/)은 그대로 두고 침범하지 않는다(슬롯 충돌 회피, 문서/블로그 SSOT 불변).
- Pyodide 자산은 1차로 공식 CDN 참조(단일 파일 25MiB 제한·번들 부피 회피), 오프라인 요구가 생기면 셀프호스팅 재검토.

## 6. 포터블 런타임 부트스트랩 (임베디드 CPython)

- 구성: CPython 공식 embeddable package(약 10~15MB zip) + codaro wheel + 최소 부트 스크립트. 무설치·무레지스트리·무관리자.
- UX: "로컬 연결" -> 번들 다운로드 -> 더블클릭 1회 -> 트레이 상주 + 127.0.0.1:8765 기동 -> 페이지 자동 연결. 이 포터블 런타임은 기존 정식 런처의 축소 진입판이며, 이후 정식 런처로의 승격(자동 업데이트·부팅 자동시작)을 안내한다.
- 관계 정의: 런처 제품 라인은 launcher/가 SSOT다. 본 문서는 "웹에서 내려주는 최소 부트스트랩"이라는 배포 형태 추가만 정의하고, 패키징 세부는 launcher/PACKAGING.md 개정으로 위임한다.
- 마찰의 하한(정직): 더블클릭 1회는 웹 보안상 제거 불가. 미서명 exe는 SmartScreen 경고가 뜬다 -> 코드 서명을 Phase 3 선결 항목으로.
- 브라우저가 로컬 실행에 닿는 다른 다리 2개는 기각/보조: 확장+Native Messaging(결국 네이티브 호스트 설치 필요, 런처 대비 이점 없음 - KILL), codaro:// 커스텀 프로토콜(데이터 채널 없음, 이미 설치된 사용자의 "로컬에서 이어 열기" 핸드오프로만 채택).
