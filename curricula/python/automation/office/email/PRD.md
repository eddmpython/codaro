# Email 트랙 PRD

## 한 줄 정의

매일 받은편지함을 정리하고, 보고서를 발송하고, 정기 알림을 보내는 흐름을 **표준 라이브러리만으로** 자동화한다. 외부 의존 0개.

## 페르소나와 도착점

| 페르소나 | 주간 메일 작업 | 이 트랙 졸업 시 산출물 |
|---|---|---|
| 마케팅 정주임 | 매주 월요일 100명 고객에게 개인화 안내 메일 수동 발송 | 03·04강 — CSV 명단 → 개인화 HTML 메일 일괄 발송 |
| 사장님 (1인 기업) | CS 메일 분류 (문의/주문/스팸) 매일 30분 | 07강 — 발신자/제목 룰 기반 자동 폴더 분류 |
| 운영 김대리 | 매일 아침 어제 매출 집계 → 팀장에게 보고 | 04·10강 — 차트 인라인 + PDF 첨부 자동 발송 |
| DevOps 박과장 | 야간 배치 스크립트 실패 시 새벽 3시 수동 확인 | 08강 — 예외 → SMTP 알림 + 로그 첨부 |

## ROI 매트릭스

| # | 강의 | 수동 (주간) | 자동 (1회) | 비고 |
|---|---|---|---|---|
| 03 | 100명 개인화 발송 | 60분 | 5초 | string.Template 치환 |
| 04 | 표·차트 일일 메일 | 20분 × 5일 = 100분 | 10초 | matplotlib + DataFrame.to_html |
| 06 | 첨부 자동 저장 | 30분 × 5일 = 150분 | 8초 | 견적서·세금계산서 받기 |
| 07 | 룰 기반 분류 | 30분 × 5일 = 150분 | 5초 | inbox zero |
| 08 | 스크립트 알림 | (장애 시 대응 지연) | 즉시 | 평균 30분 → 즉시 통보 |
| 10 | 주간 보고서 발송기 | 90분 / 주 | 30초 | CSV → 차트 → HTML + PDF + 발송 |

총합 기준 주간 **8시간 이상** 절감.

## 라이브러리 경계와 결정 근거

**외부 패키지 0개. Python 표준 라이브러리만.**

| 모듈 | 역할 | 사용 강의 |
|---|---|---|
| `smtplib.SMTP_SSL` | 발송 (465 포트) | 01·02·03·04·08·09·10 |
| `email.message.EmailMessage` | MIME 메시지 구성 | 01·02·03·04·08·10 |
| `email.mime.*` | 첨부·인라인 이미지 (EmailMessage로 부족할 때) | 02·04 |
| `imaplib.IMAP4_SSL` | 수신·검색·이동 | 05·06·07 |
| `email.parser.BytesParser` | 받은 메일 파싱 | 06 |
| `ssl` | TLS 컨텍스트 | 01-10 공통 |

**왜 표준만:**
- `yagmail`, `mailgun` 같은 래퍼는 편하지만 자동화 본질(SMTP/IMAP)을 숨김 → 학습 가치 ↓ + 실무 트러블슈팅도 표준이 보편.
- 외부 의존 0개는 `regex` 트랙과 동일 정책 → 학습 자산 일관성.
- **dev 의존성** 단 하나 `aiosmtpd` — 10강 통합 검증의 로컬 SMTP 서버용. 메인 의존성 아님.

**대안 비교:**
- `yagmail` → 3줄 발송 가능하나 모든 안전 가드(dryRun, 환경변수)를 우회. 학습 부적합.
- `sendgrid`/`mailgun` API → 외부 서비스 가입·과금. 학습 진입장벽.
- Outlook/M365 OAuth → 입문 난이도 폭증. 본 트랙은 SMTP/IMAP만, OAuth는 09강에서 패턴만 언급.

## 한국 사무환경 특화 (kr-specific)

- **00 소개**: Gmail 앱 비밀번호 + **Naver 메일 2단계 인증 + 앱 비밀번호** 절차를 한국어 화면 캡처와 함께. Naver는 한국 직장인 비중 큼.
- **02·04강 첨부 한글 파일명**: `Content-Disposition`의 한글 파일명 깨짐 → `email.utils.encode_rfc2231` 패턴 명시.
- **06강 첨부 저장**: 한국 회계 실무자 사례 — 매월 거래처에서 오는 **세금계산서·견적서 PDF** 자동 분류·저장.
- **03강 개인화**: "안녕하세요, {이름}님" + 한국 존칭 + 직책 매핑 (대리/과장/팀장) 룰 예시.
- **08강 알림**: 한국 야간 배치(00:00·03:00) 시간대 + Slack/Teams가 아닌 SMS 게이트웨이 메일 발송 패턴(통신사 SMS게이트웨이) 한국 특화.

## 10 프로젝트 + 1 소개

| # | 파일 | 배지 | 핵심 개념 | 산출물 | 페르소나 |
|---|------|------|---------|------|------|
| 00 | `00_email소개.yaml` | 소개 | SMTP/IMAP 차이, 앱 비밀번호 발급, dryRun 안전 | 환경 점검 | 전체 |
| 01 | `01_첫메일발송.yaml` | 입문 | A, B, C (SMTP_SSL, login, EmailMessage, send_message) | 자기 자신에게 텍스트 메일 | 전체 |
| 02 | `02_html과첨부.yaml` | 입문 | D, E (add_alternative HTML, add_attachment) | HTML 메일 + PDF 첨부 | 마케팅 정주임 |
| 03 | `03_다수수신자와개인화.yaml` | 기초 | F, G (To/CC/BCC, string.Template) | CSV → 100명 개인화 발송 | 마케팅 정주임 |
| 04 | `04_표와차트삽입.yaml` | 기초 | H, I (Content-ID, DataFrame.to_html) | 표+차트 일일 메일 | 운영 김대리 |
| 05 | `05_imap으로받기.yaml` | 기초 | J, K (IMAP4_SSL, select, search, fetch) | 최근 7일 메일 제목 | 사장님 |
| 06 | `06_첨부자동저장.yaml` | 중급 | L, M (BytesParser, walk, disposition) | 세금계산서 첨부 → 폴더 정리 | 사장님 |
| 07 | `07_규칙기반분류.yaml` | 중급 | N (IMAP MOVE, 발신자/제목 룰) | 발신자별 자동 분류 | 사장님 |
| 08 | `08_스크립트결과알림.yaml` | 중급 | O (예외 → 알림 함수, 로그 첨부) | 실패 시 스택트레이스 메일 | DevOps 박과장 |
| 09 | `09_안전한자격증명관리.yaml` | 심화 | P (os.environ, .env, dryRun 일관) | 환경 격리 발송 모듈 | 전체 |
| 10 | `10_주간보고서발송기.yaml` | 심화 | 전 개념 종합 + aiosmtpd | CSV → 차트 → HTML+PDF → 다수 발송 + 알림 | 운영 김대리 |

## 강의 간 산출물 체인

```
01 (자기 자신 텍스트) → 02 (HTML+첨부) → 03 (다수+개인화) → 04 (표/차트)
                                                            ↓
05 (IMAP 받기) → 06 (첨부 저장) → 07 (룰 분류)             ↓
                                                            ↓
                              09 (자격증명 안전) ────→ 10 (주간 보고서: 03·04·08 모두 결합)
                                                            ↑
                                                       08 (알림 봇 — 10의 오류 알림으로 흡수)
```

10강은 03·04·06·08·09의 패턴을 모두 호출하는 종합 산출물. 학습자가 "10강 = 내 주간 업무 자동화 도구" 인식.

## 개념 분배 매트릭스

| 개념 | 01 | 02 | 03 | 04 | 05 | 06 | 07 | 08 | 09 | 10 |
|------|----|----|----|----|----|----|----|----|----|----|
| A. SMTP_SSL 연결 | ✓ | ✓ | ✓ | ✓ |   |   |   | ✓ | ✓ | ✓ |
| B. login·send_message | ✓ | ✓ | ✓ | ✓ |   |   |   | ✓ | ✓ | ✓ |
| C. EmailMessage | ✓ | ✓ | ✓ | ✓ |   |   |   | ✓ |   | ✓ |
| D. add_alternative(HTML) |   | ✓ |   | ✓ |   |   |   |   |   | ✓ |
| E. add_attachment |   | ✓ |   | ✓ |   |   |   | ✓ |   | ✓ |
| F. To/CC/BCC |   |   | ✓ |   |   |   |   |   |   | ✓ |
| G. string.Template |   |   | ✓ | ✓ |   |   |   |   |   | ✓ |
| H. Content-ID 인라인 |   |   |   | ✓ |   |   |   |   |   | ✓ |
| I. DataFrame.to_html |   |   |   | ✓ |   |   |   |   |   | ✓ |
| J. IMAP4_SSL·select |   |   |   |   | ✓ | ✓ | ✓ |   |   |   |
| K. search·fetch |   |   |   |   | ✓ | ✓ | ✓ |   |   |   |
| L. BytesParser |   |   |   |   |   | ✓ |   |   |   |   |
| M. walk·disposition |   |   |   |   |   | ✓ |   |   |   |   |
| N. IMAP MOVE |   |   |   |   |   |   | ✓ |   |   |   |
| O. 예외 → 알림 |   |   |   |   |   |   |   | ✓ |   | ✓ |
| P. 환경변수·dryRun (공통) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| EmailMessage assert (공통) | ✓ | ✓ | ✓ | ✓ |   |   |   | ✓ |   | ✓ |
| aiosmtpd 통합 검증 |   |   |   |   |   |   |   |   |   | ✓ |

## 흔한 오개념 맵

| # | 오개념 | 실제 | 해소 강의 |
|---|---|---|---|
| 1 | "Gmail에 일반 비밀번호로 로그인된다" | 2022년부터 차단. 앱 비밀번호 또는 OAuth 필수 | 00 |
| 2 | "smtplib.SMTP가 SMTP_SSL과 같다" | 587(STARTTLS) vs 465(SSL) 다름. 465 권장 | 01 |
| 3 | "EmailMessage 본문에 한글 그대로 OK" | 인코딩 명시 안 하면 base64로 잘못 인코딩되어 깨짐 | 01 (`set_content(..., charset="utf-8")`) |
| 4 | "BCC에 넣으면 다른 수신자에게 안 보인다" | 메일 본문엔 안 보이나 헤더는 서버 로그에 남음 | 03 |
| 5 | "첨부 한글 파일명은 자동 처리" | 깨짐. RFC2231 인코딩 필요 | 02·04 |
| 6 | "imap.search로 한국어 검색된다" | IMAP의 한글 검색은 서버마다 다름. UID + 본문 파싱 권장 | 05 |
| 7 | "IMAP move = 복사+삭제" | 진짜 MOVE는 RFC 6851. 미지원 서버는 copy+expunge | 07 |
| 8 | "발송 직후 자기 inbox에서 확인 가능" | 자기 자신에 발송도 받기까지 1-30초 지연 | 01 |
| 9 | "dryRun 없이 빠르게 테스트해도 안전" | 100명 명단에 실수로 보내면 회수 불가 + 스팸 차단 | 09 (전 강 공통) |
| 10 | "환경변수 = 안전" | `.env` 파일 git 커밋 사고 잦음. `.gitignore` 필수 | 09 |

## 트랙 간 결합점

- **PDF ↔ Email**: 04강·10강에서 PDF 트랙의 청구서·보고서를 첨부. `practical/` 통합의 핵심.
- **openpyxl ↔ Email**: openpyxl 10(매출 리포트)의 xlsx를 첨부.
- **pandas ↔ Email**: 04강 `DataFrame.to_html()` 직결.
- **automation/watchSched ↔ Email**: 08강의 알림 패턴이 스케줄러 + 메일로 확장 (주간 배치 → 결과 메일).
- **llmBasics ↔ Email**: 07강 룰 분류를 LLM 분류로 업그레이드하는 확장 변주.

## 확장 변주 카탈로그 (강의별)

**03강 확장:**
- 생일자 자동 축하 메일
- 미수금 고객에게 자동 안내
- 신입사원 환영 메일 시리즈 (Day 1 / Day 7 / Day 30)

**07강 확장:**
- 발신자 화이트리스트 / 블랙리스트
- 특정 키워드(`긴급`, `장애`) → 우선순위 폴더
- 첨부 있는 메일만 별도 폴더

**10강 확장:**
- 주간이 아닌 일간/월간 보고서 발송
- 수신자별 다른 데이터 cut (지역별 / 부서별)
- 발송 결과 로그를 Google Sheets 또는 Notion에 기록

## 안전 정책 (필수, 모든 강의 첫 셀)

1. **자격증명은 환경변수만** — 코드에 평문 비밀번호 금지. `os.environ["SMTP_APP_PASS"]`.
2. **앱 비밀번호 / OAuth만** — 일반 비밀번호 차단.
3. **dryRun 플래그 의무화** — 모든 발송 함수 `dryRun=True` 기본. 실 발송은 명시.
   ```python
   def sendReport(recipient, body, dryRun=True):
       msg = buildMessage(recipient, body)
       if dryRun:
           return msg
       with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
           smtp.login(SMTP_USER, SMTP_APP_PASS)
           smtp.send_message(msg)
   ```
4. **IMAP 작업은 별도 폴더 안에서만** — `INBOX/CodaroTest` 전용 폴더. 실수로 inbox 삭제 절대 금지.

## 검증 전략

**(a) 단위 검증 (01-09)** — `EmailMessage` 객체 자체를 assert. 외부 의존 0, 빠름.

```python
msg = buildMessage(
    to="me@example.com",
    subject="월간 보고서",
    body="첨부 확인 부탁드립니다",
    attachments=[reportPath],
)
assert msg["To"] == "me@example.com"
assert msg.get_content_type() == "multipart/mixed"
assert any(p.get_filename() == "report.pdf" for p in msg.iter_attachments())
```

**(b) 통합 검증 (10강)** — `aiosmtpd`로 로컬 SMTP 서버 띄우고 자기 자신에 발송 후 수신함 검증.

```python
from aiosmtpd.controller import Controller
controller = Controller(handler, hostname="127.0.0.1", port=8025)
controller.start()
try:
    sendReport(..., smtpHost="127.0.0.1", smtpPort=8025, useSSL=False)
    assert len(handler.received) == 5
finally:
    controller.stop()
```

IMAP 검증(05-07)은 mock 어려움 → 학습자 본인 계정 절차 가이드 + 약한 검증("에러 없이 N개 이상 받음").

## 실행 환경

- Python 3.12+ + `uv`. 외부 의존 0개. 개발 검증용 aiosmtpd는 테스트 환경 전용 의존성으로만 둔다.
- `SMTP_USER`/`SMTP_APP_PASS` 환경변수 미설정 시 통합 테스트 skip.

## 레슨 yaml 작성 규약

PDF 트랙과 동일 + 추가 (S급 기준):
- intro.benefits 1개 항목은 ROI 매트릭스의 해당 행에서 시간 수치 인용.
- 마지막 섹션 직전에 **흔한 오개념 맵** 해당 행을 tip/note로 명시.
- 마지막 섹션에 **확장 변주 카탈로그** 3-5개 list.
- 보안 안티패턴(평문 비밀번호, .env 커밋) 발견 시 별도 warning 블록.

## 진척 검증

- `_taxonomy.yml`에 outcomes 9개(automation.email.*) + domain `emailAutomation` 등록.
- `__init__.py`에 `email` 카테고리 등록 (5곳).
- `illustration.py` 카드 SVG.
- `tests/run.py preflight` + `tests/testCurriculumOs.py` 통과.

## 남은 결정사항

1. **00 소개 다룰 메일 서비스 범위**: Gmail 기본 + Naver 보조 / Outlook OAuth는 09 확장 변주에서 언급만. **권장: 확정**.
2. **10강 발송 대상**: aiosmtpd 로컬 검증 메인 + 실무 변주로 본인 계정 환경변수 + dryRun=False 시연 옵션. **권장: 확정**.
3. **08강 SMS 게이트웨이 사례**: 통신사 SMS게이트웨이(SKT/KT/LGU+) 도메인은 변경 잦음 → 강의 본문엔 일반 메일 알림만, 확장 변주에 "SMS 게이트웨이 패턴" 한 줄 언급. **권장: 확정**.
