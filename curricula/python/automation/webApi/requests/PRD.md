# requests 트랙 PRD

## 한 줄 정의

매일 외부 API에서 데이터를 받아 가공·저장·통보하는 흐름을 `requests` 한 패키지로 자동화한다. 마지막 한 강의만 `httpx`로 비동기·병렬을 다룬다.

## 페르소나와 도착점

| 페르소나 | 주간 API 작업 | 이 트랙 졸업 시 산출물 |
|---|---|---|
| 데이터 분석 김주임 | 매일 공공데이터포털에서 미세먼지·기상 조회 → 엑셀 정리 (40분/일) | 01·07·10강 — 페이지네이션 자동 수집 + DataFrame 저장 |
| 운영 박대리 | 매일 환율 사이트 보고 사내 게시판에 옮김 (15분/일) | 02·05강 — 환율 API → 안전 호출 + 로컬 캐시 |
| 마케팅 정주임 | 캠페인 결과를 Naver/Kakao Open API로 점검 (회당 30분) | 03·08강 — 헤더 인증 + 이미지 일괄 다운로드 |
| DevOps 박과장 | 배치 결과를 Slack에 수동 통보 (장애당 10분) | 04·05강 — POST 호출 + 재시도 가드 |

## ROI 매트릭스

| # | 강의 | 수동 (주간) | 자동 (1회) | 비고 |
|---|---|---|---|---|
| 01 | 공공 API 단발 조회 | 10분 × 5일 = 50분 | 2초 | requests.get + .json() |
| 02 | 환율 모니터링 | 15분 × 5일 = 75분 | 3초 | params + 로컬 저장 |
| 03 | API 키로 외부 데이터 결합 | 30분 × 3회 = 90분 | 5초 | headers + env var |
| 04 | Slack 알림 발송 | 10분 × 5장애 = 50분 | 즉시 | POST json= |
| 05 | 일시 장애에 안전한 호출 | (장애 시 디버깅 30분) | 즉시 복구 | retry + timeout |
| 07 | GitHub 전체 issue 수집 | 60분 (수동 페이지 이동) | 30초 | cursor pagination |
| 08 | 100장 이미지 다운로드 | 40분 | 10초 | stream + iter_content |
| 09 | 100 URL 일괄 조회 | 순차 5분 → 병렬 5초 | 5초 | httpx.AsyncClient |
| 10 | 매일 공공 API 수집기 | 40분/일 = 200분/주 | 1분/회 | 전 패턴 결합 |

총합 기준 주간 **8시간 이상** 절감.

## 라이브러리 경계와 결정 근거

**메인: `requests` 한 패키지. 09강만 `httpx` (async 학습 가치 + 현대적 대체).**

| 모듈/객체 | 역할 | 사용 강의 |
|---|---|---|
| `requests.get` / `requests.post` | 단발 호출 | 01·02·03·04 |
| `requests.Session` | 쿠키·헤더·커넥션 풀 유지 | 06·07·10 |
| `Response.json()` / `.text` / `.content` / `.iter_content` | 응답 파싱 | 01-08 |
| `requests.exceptions.*` + `Retry` | 에러 처리 | 05·10 |
| `httpx.AsyncClient` + `asyncio.gather` | 비동기 병렬 | 09 |
| `os.environ` + `.env`/dotenv 패턴 | 자격증명 | 03 이후 공통 |

**왜 `requests` 메인:**
- 동기 모델이 학습 곡선이 가장 완만. 한국 자료·SO 답변·StackOverflow 비중 압도적.
- 모든 운영 자동화 스크립트가 동기 + 일회성이 기본. 비동기는 99% 케이스에서 과잉.
- 실무 트러블슈팅(SSL, 프록시, 쿠키, 인증) 사례가 모두 `requests` 어휘 기준으로 축적되어 있음.

**왜 `httpx`는 09강 단일:**
- async 패턴을 한 번은 노출 — 100개 URL 병렬은 동기로 실측 불가. 데이터 수집 실무의 천장.
- `httpx`는 동기/비동기 API가 거의 동일 → `requests` 사용자가 1시간 안에 이전 가능. 학습 비용 최소.

**대안 비교:**
- `urllib.request` 표준 → JSON·세션·헤더 처리에 보일러플레이트 폭증. 본 트랙 안 씀.
- `aiohttp` → 비동기 전용. async 학습 곡선 가파름. `httpx`보다 진입 비용 큼 → 09강에선 `httpx`.
- `requests-html` / `urllib3` → 추가 의존성 가치 없음.

## 한국 사무환경 특화 (kr-specific)

- **00 소개**: data.go.kr 공공데이터포털 회원가입 → 인증키 신청 → 일반 인증키(URL Encoded) / 디코딩 키 구분을 한국어 화면 흐름으로.
- **01강**: 한국환경공단 에어코리아 미세먼지 API (인증 없는 샘플) 또는 기상청 단기예보 (공공 인증키 패턴).
- **02강**: KEB 하나은행 / 한국수출입은행 환율 API (정부 공공 API, 인증 필요) — 매일 09:00 갱신, 주말은 마지막 영업일 값.
- **03강**: Naver Open API (검색·블로그·뉴스) — `X-Naver-Client-Id` / `X-Naver-Client-Secret` 헤더 두 개. Kakao Open API는 `Authorization: KakaoAK {REST_API_KEY}`.
- **04강**: Slack incoming webhook (한국 회사도 표준), 보조로 카카오워크/잔디 webhook 패턴 한 줄.
- **05강**: 한국 ISP 야간 점검 시간대(02:00-05:00) 호출 실패 시나리오 + retry/backoff.
- **07강**: GitHub REST/GraphQL 페이지네이션 — 한국어 개발자 채용 공고/이슈 수집.
- **10강**: 미세먼지 + 기상 + 환율 3개 API 결합 → 일일 사내 통보 시트.

## 10 프로젝트 + 1 소개

| # | 파일 | 배지 | 핵심 개념 | 산출물 | 페르소나 |
|---|------|------|---------|------|------|
| 00 | `00_requests소개.yaml` | 소개 | HTTP/REST/JSON 감각, status code, 안전 정책 | 환경 점검 | 전체 |
| 01 | `01_첫GET요청.yaml` | 입문 | A, B, C (get, status_code, .json()) | 미세먼지 현황 조회 | 데이터 |
| 02 | `02_쿼리파라미터와환율.yaml` | 입문 | D, E (params=, dict 헬퍼) | 매일 환율 표 | 운영 |
| 03 | `03_헤더와API키.yaml` | 기초 | F, G (headers=, os.environ) | Naver 검색 결과 표 | 마케팅 |
| 04 | `04_POST와JSON전송.yaml` | 기초 | H, I (json=, data=, form vs json) | Slack 알림 봇 | DevOps |
| 05 | `05_에러처리와재시도.yaml` | 기초 | J, K (timeout, raise_for_status, Retry) | 안전 호출 헬퍼 | 전체 |
| 06 | `06_Session과로그인흐름.yaml` | 중급 | L, M (Session, cookies, persist) | 인증 후 데이터 수집 | 운영 |
| 07 | `07_페이지네이션수집.yaml` | 중급 | N (cursor/offset pagination + generator) | GitHub repo 전체 issue | 데이터 |
| 08 | `08_파일업다운과스트리밍.yaml` | 중급 | O, P (files=, stream=, iter_content) | 이미지 일괄 다운로드 | 마케팅 |
| 09 | `09_httpx비동기병렬.yaml` | 심화 | Q, R (httpx.AsyncClient, asyncio.gather, Semaphore) | 100 URL 병렬 조회 | 데이터 |
| 10 | `10_매일공공API수집기.yaml` | 심화 | 전 개념 종합 | 3 API → DataFrame → 차트 → 저장 | 데이터 |

## 강의 간 산출물 체인

```
01 (단발 GET) → 02 (params + 캐시) → 03 (헤더 인증) → 04 (POST 알림)
                                                            ↓
                              05 (재시도·timeout) ────────→ ↓
                                                            ↓
06 (Session 로그인) → 07 (페이지네이션) → 08 (스트리밍 다운로드)
                                                            ↓
                                       09 (async 병렬) ───→ 10 (수집기: 03·05·07·08·09 결합)
```

10강은 03·05·07의 패턴을 모두 호출하는 종합 산출물. 학습자가 "10강 = 내 일일 데이터 수집기" 인식.

## 개념 분배 매트릭스

| 개념 | 01 | 02 | 03 | 04 | 05 | 06 | 07 | 08 | 09 | 10 |
|------|----|----|----|----|----|----|----|----|----|----|
| A. requests.get | ✓ | ✓ | ✓ |   | ✓ | ✓ | ✓ | ✓ |   | ✓ |
| B. status_code·raise_for_status | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |   | ✓ |
| C. .json() 파싱 | ✓ | ✓ | ✓ | ✓ |   | ✓ | ✓ |   |   | ✓ |
| D. params= 쿼리스트링 |   | ✓ | ✓ |   |   | ✓ | ✓ |   |   | ✓ |
| E. URL 인코딩 헬퍼 |   | ✓ |   |   |   |   | ✓ |   |   | ✓ |
| F. headers= |   |   | ✓ | ✓ |   | ✓ | ✓ | ✓ |   | ✓ |
| G. os.environ 자격증명 |   |   | ✓ | ✓ |   | ✓ | ✓ |   |   | ✓ |
| H. requests.post |   |   |   | ✓ |   |   |   | ✓ |   | ✓ |
| I. json= vs data= |   |   |   | ✓ |   |   |   | ✓ |   | ✓ |
| J. timeout |   |   |   |   | ✓ |   |   | ✓ |   | ✓ |
| K. Retry + backoff |   |   |   |   | ✓ |   |   |   |   | ✓ |
| L. requests.Session |   |   |   |   |   | ✓ | ✓ | ✓ |   | ✓ |
| M. cookies persist |   |   |   |   |   | ✓ |   |   |   |   |
| N. pagination generator |   |   |   |   |   |   | ✓ |   |   | ✓ |
| O. files= (multipart) |   |   |   |   |   |   |   | ✓ |   |   |
| P. stream + iter_content |   |   |   |   |   |   |   | ✓ |   | ✓ |
| Q. httpx.AsyncClient |   |   |   |   |   |   |   |   | ✓ |   |
| R. asyncio.gather + Semaphore |   |   |   |   |   |   |   |   | ✓ |   |
| dryRun·sandbox URL (공통) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

## 흔한 오개념 맵

| # | 오개념 | 실제 | 해소 강의 |
|---|---|---|---|
| 1 | "응답 .text와 .json() 동일" | .text는 문자열, .json()은 파싱된 dict/list. 응답이 JSON이 아니면 .json()은 예외 | 01 |
| 2 | "200이면 성공" | 200·201·204 모두 성공. 4xx·5xx는 실패. `raise_for_status()`가 표준 가드 | 01·05 |
| 3 | "params를 URL에 직접 합쳐도 됨" | 한글·특수문자 인코딩 누락. `params=` 키워드는 자동 인코딩 | 02 |
| 4 | "API 키는 URL 쿼리에 넣어도 됨" | 일부 API는 허용하나 로그·캐시·referer에 노출. `headers=`가 표준 | 03 |
| 5 | "form data와 json은 같음" | `data=` → urlencoded body, `json=` → application/json. 서버 사양에 맞춰야 함 | 04 |
| 6 | "timeout 없어도 됨" | 기본 무한 대기. 서버 행 시 스크립트 영구 정지. 항상 `timeout=10` 이상 | 05 |
| 7 | "for url in urls: requests.get(url) 충분" | 매 호출마다 TLS 핸드셰이크 반복 → 10배 느림. Session 권장 | 06 |
| 8 | "next 페이지 없으면 totalCount만 보고 1회 호출" | totalCount는 추정치. has_next/Link 헤더가 진실. 그래서 generator + 종료 조건 명확 | 07 |
| 9 | "큰 파일도 r.content면 됨" | 메모리에 전체 로드. 100MB 파일이면 메모리 폭증. `stream=True` + `iter_content` | 08 |
| 10 | "async 쓰면 무조건 빠름" | rate limit 무시 시 차단·BAN. Semaphore로 동시성 제한 필수 | 09 |
| 11 | "API 키를 코드에 넣고 .gitignore만 잘 하면 됨" | git 히스토리·실수 푸시 사고 잦음. 환경변수 + dryRun이 표준 | 03 |
| 12 | "환율 API는 24시간 갱신" | KEB는 영업일 09:00 갱신, 주말 호출은 금요일 값. 캐시·휴일 처리 필수 | 02·10 |

## 트랙 간 결합점

- **pandas ↔ requests**: 01·07·10강에서 `.json()` 결과 → `pd.DataFrame()`. pandas 트랙의 분석 흐름과 직결.
- **regex ↔ requests**: 응답 본문에서 비정형 추출 시 정규식 트랙과 결합.
- **automation/watchSched ↔ requests**: 10강의 일일 수집기를 스케줄러로 묶음.
- **automation/email ↔ requests**: 10강 결과를 이메일 트랙의 04강 패턴으로 보고서 발송.
- **automation/office/openpyxl ↔ requests**: 수집 결과를 xlsx로 정리.
- **llmBasics ↔ requests**: LLM API도 결국 requests.post. 04강의 패턴이 그대로 적용.

## 확장 변주 카탈로그 (강의별)

**01강 확장:**
- 다른 공공 API로 동일 패턴 (기상청·KOSIS·한국관광공사)
- 응답 캐시 (응답이 같으면 호출 생략, `last-modified` 헤더 활용)
- 응답이 XML인 API 한 줄로 대응 (`xmltodict`)

**05강 확장:**
- 4xx vs 5xx 별 다른 정책 (4xx는 재시도 무의미, 5xx만 백오프)
- Circuit breaker 패턴 (연속 실패 N회면 일시 정지)
- 호출 실패를 Slack/이메일로 즉시 통보

**07강 확장:**
- offset 기반 vs cursor 기반 vs Link 헤더 기반 세 종류 비교
- 페이지 진행 상황을 progress bar로 표시
- 중단된 수집을 재개 (마지막 cursor 저장)

**10강 확장:**
- 수집 결과를 SQLite/DuckDB에 누적
- 수집 결과의 변화량만 통보 (전일 대비 미세먼지 +20)
- 수집 실패 시 자동 재시도 + 알림

## 안전 정책 (필수, 모든 강의 첫 셀)

1. **자격증명은 환경변수만** — `os.environ["NAVER_CLIENT_ID"]`. 코드에 평문 키 금지.
2. **timeout 의무화** — 모든 호출에 `timeout=10` 이상. 무한 대기 차단.
3. **sandbox/예제 URL 우선** — 학습 중에는 `httpbin.org`, 공공 sample, GitHub public API 등 인증 없는 엔드포인트로 동작 확인 후에만 실 API 호출.
4. **rate limit 존중** — 09강 async 호출은 `Semaphore`로 동시성 제한. 04강 webhook 호출은 sleep 가드.
5. **dryRun 일관성** — POST/PUT/DELETE 같은 부수효과 호출은 기본 `dryRun=True`. 04·08·10강 공통.

```python
def callApi(url, dryRun=True, timeout=10):
    if dryRun:
        return {"_dryRun": True, "url": url}
    r = requests.get(url, timeout=timeout)
    r.raise_for_status()
    return r.json()
```

## 검증 전략

**(a) 단위 검증 (01-09)** — 응답 객체 자체를 assert. 공공 API는 가벼운 GET으로 실제 호출하고, POST/인증 API는 `httpbin.org` 또는 `mock` 응답으로 대체.

```python
r = requests.get("https://httpbin.org/get", params={"q": "codaro"}, timeout=10)
assert r.status_code == 200
assert r.json()["args"]["q"] == "codaro"
```

**(b) 통합 검증 (10강)** — 3 API 모두 단발 호출 + DataFrame 행수 ≥ 1 확인. 실패 시 마지막 캐시 값 폴백 검증.

**(c) 네트워크 의존 강의의 안전판** — 01·02·07·10강은 네트워크 없는 환경에서 `requests-mock` 또는 sample JSON 파일 폴백 패턴을 제공.

## 실행 환경

- Python 3.12+ + `uv`.
- 의존성: `requests` (메인), `httpx` (09강), `pandas` (07·10강에서 결합).
- 환경변수: `NAVER_CLIENT_ID`/`NAVER_CLIENT_SECRET` (03강), `SLACK_WEBHOOK_URL` (04강), `GITHUB_TOKEN` (07강 선택), `DATA_GO_KR_KEY` (10강).
- 학습자에게 환경변수 미설정 시 sample 응답으로 폴백한다는 점을 명시.

## 레슨 yaml 작성 규약

email 트랙과 동일 + 추가 (S급 기준):
- intro.benefits 1개 항목은 ROI 매트릭스의 해당 행에서 시간 수치 인용.
- 마지막 섹션 직전에 **흔한 오개념 맵** 해당 행을 tip/note로 명시.
- 마지막 섹션에 **확장 변주 카탈로그** 3-5개 list.
- 네트워크 의존 강의는 응답 캐시 / sample JSON 폴백 패턴을 첫 단계에서 명시.

## 진척 검증

- `_taxonomy.yml`에 outcomes 12개(`automation.webApi.*`) + domain `apiAutomation` 등록.
- `__init__.py`에 `requests` 카테고리 등록 (5곳: categoryMapping, categoryMeta, categoryGroups, categoryTree, learningPaths).
- `tests/run.py preflight` 통과.

## 남은 결정사항

1. **02강 환율 API 선택**: 한국수출입은행(무료, 영업일 09:00 갱신, 인증키 필요) / exchangerate.host(무료, 실시간, 인증 불필요). **권장: exchangerate.host 메인 + 한국수출입은행 보조 노트** — 인증 없이 즉시 학습 가능.
2. **03강 Naver vs Kakao**: 둘 다 학습 가치 있음. **권장: Naver를 메인(검색 API), Kakao는 확장 변주로 1줄 언급** — 헤더 키 두 개로 더 단순.
3. **07강 페이지네이션 대상**: GitHub Issues (인증 없이 60req/h) vs 공공데이터포털 다건 API. **권장: GitHub 메인** — Link 헤더 + cursor 두 패턴 모두 노출.
4. **09강 async 대상 URL**: httpbin.org 100개 vs Wikipedia API. **권장: httpbin.org/delay** — 의도적 지연으로 async 효과 시각화.
