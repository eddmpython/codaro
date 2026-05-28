# PDF 트랙 PRD

## 한 줄 정의

받은 PDF에서 **뽑고**(텍스트·표·메타), 새 PDF로 **만들고**(한글 보고서·청구서), 묶고·자르고·잠그는 흐름을 **로컬 Python 한 사이클**로 끝낸다.

## 페르소나와 도착점

| 페르소나 | 주간 PDF 작업 | 이 트랙 졸업 시 산출물 |
|---|---|---|
| 회계팀 김대리 | 매월 200건 거래내역 → 고객별 청구서 PDF 수동 작성 | 10강 **월간 청구서 생성기** — CSV 한 번 돌리면 200개 PDF |
| 총무팀 박과장 | 협력사 견적·계약서 PDF 50종 → 단원별 분리·통합 반복 | 02강 패턴으로 자동 분리·병합 스크립트 |
| 마케팅 이주임 | 제휴사 공유용 보고서 PDF에 워터마크 + 패스워드 수동 처리 | 08강 산출물 — 일괄 워터마크·암호화 |
| HR 윤대리 | 국세청·공공기관 PDF 표를 엑셀에 손으로 옮김 | 04강 산출물 — pdfplumber로 표 → CSV → openpyxl 연계 |

각 페르소나의 도착점이 10강 중 어느 산출물에 직접 매핑되는지 강의 표에 표시.

## ROI 매트릭스

수동 작업 시간(50건 기준) 대비 자동화 후 1회 실행 시간. 학습자가 첫 강의부터 "내 시간 얼마나 줄어드나" 체감.

| # | 강의 | 수동 (50건) | 자동 (1회) | 비고 |
|---|---|---|---|---|
| 01 | 페이지수·메타데이터 | 25분 | 2초 | 50개 PDF 일괄 점검 |
| 02 | 병합·분할 | 40분 | 5초 | 협력사별 PDF 묶음 |
| 03 | 텍스트 추출 | 60분 | 8초 | 회의록 PDF → 마크다운 |
| 04 | 표 추출 | 90분 | 10초 | 정부 통계 PDF → CSV |
| 07 | 표+이미지 보고서 | 120분 | 15초 | 월간 보고서 양식 자동 |
| 08 | 워터마크·암호화 | 50분 | 6초 | 사외 공유 보안 처리 |
| 10 | 월간 청구서 생성기 (200건) | 400분 (6.7시간) | 30초 | 회계팀 매월 작업 |

총합 기준 월 **15시간 이상** 절감이 현실적 목표.

## 라이브러리 경계와 결정 근거

| 라이브러리 | 역할 | 사용 강의 | 라이선스 |
|---|---|---|---|
| `pypdf` | 읽기, 페이지 추출, 병합, 분할, 메타데이터, 암호화 | 01·02·03·08·09·10 | BSD |
| `pdfplumber` | 텍스트와 **표 구조** 추출 — pypdf의 빈자리 | 03·04·10 | MIT |
| `reportlab` | PDF 생성 (저수준, 한글 폰트 임베드) | 05·06·07·08·10 | BSD |

**왜 3개를 한 트랙에:** 사무 PDF 작업은 "받은 PDF에서 뭔가 뽑고 → 새 PDF로 묶거나 만든다"가 한 흐름이라 둘로 쪼개면 학습 동선이 끊긴다. 04강까지 **읽기/조작**(pypdf+pdfplumber), 05강부터 **생성**(reportlab), 10강에서 **읽기→생성** 한 사이클 통합.

**대안 비교 (결정 고정):**
- `PyPDF2` → 유지보수 종료. 후속이 `pypdf`. 새 코드는 `pypdf`로만.
- `fpdf2` → reportlab보다 단순하지만 Platypus 같은 레이아웃 엔진 없음. reportlab 하나로 통일.
- `PyMuPDF`(fitz) → 빠르나 **AGPL 라이선스**로 상용 학습 자산엔 부담. 회피.
- `borb`, `pikepdf` → 강력하지만 입문 트랙에 인지부하 가중. 회피.

## 한국 사무환경 특화 (kr-specific)

이 트랙의 차별점이자 S급 기준. 일반 영어 강의에 없는 한국 사례를 의도적으로 끼워넣는다:

- **04강 데이터**: 국세청 부가가치세 신고서 PDF 또는 통계청 KOSIS PDF 표를 실제 추출. 한국 정부 PDF 특유의 **세로 병합 셀** 처리 사례가 학습 가치 큼.
- **06강 한글 폰트**: 맑은 고딕(Windows 기본) / AppleSDGothicNeo (macOS) / NanumGothic (Linux) 3-OS 분기 헬퍼.
- **08강 워터마크**: "사내전용", "대외비" 한글 워터마크. 한글 폰트 등록을 워터마크 합성에서도 재사용.
- **10강 청구서 양식**: 한국 사업자 청구서 표준 양식(상호·사업자등록번호·공급가액·세액·합계 분리)을 그대로 재현. 회계 실무자가 바로 쓸 수 있는 수준.
- **09강 양식 PDF**: 한국 공공기관 신청서(이름·주민/사업자번호·주소·서명란) 패턴.

## 10 프로젝트 + 1 소개

| # | 파일 | 배지 | 핵심 개념 | 산출물 | 페르소나 매핑 |
|---|------|------|---------|------|------|
| 00 | `00_pdf소개.yaml` | 소개 | pypdf vs pdfplumber vs reportlab 경계, 한글 폰트 헬퍼 | 환경 점검 + 한 줄 PDF | 전체 |
| 01 | `01_pdf열고페이지정보.yaml` | 입문 | A, B (PdfReader, pages, metadata) | 50개 PDF 일괄 점검 보고서 | 총무 박과장 |
| 02 | `02_pdf병합과분할.yaml` | 입문 | C, D (PdfWriter.add_page, write) | 협력사별 묶음 + 단원별 분할 | 총무 박과장 |
| 03 | `03_텍스트추출.yaml` | 기초 | E, F (extract_text, pdfplumber.open) | 회의록 PDF → 마크다운 | 전체 |
| 04 | `04_표추출.yaml` | 기초 | G, H (extract_tables → DataFrame) | 국세청 PDF 표 → CSV | HR 윤대리 |
| 05 | `05_첫pdf생성.yaml` | 기초 | I, J (Canvas, drawString, setFont, save) | "Hello PDF" 1페이지 | 전체 |
| 06 | `06_한글폰트와스타일.yaml` | 중급 | K, L (TTFont 등록, Paragraph, Style) | 한글 보고서 표지 | 회계 김대리 |
| 07 | `07_표와이미지삽입.yaml` | 중급 | M, N, O (Platypus Table, Image, SimpleDocTemplate) | 표+로고 보고서 | 마케팅 이주임 |
| 08 | `08_워터마크와암호화.yaml` | 중급 | P, Q (encrypt, overlay) | "사내전용" + 패스워드 | 마케팅 이주임 |
| 09 | `09_양식채우기.yaml` | 심화 | R (AcroForm 필드) | 신청서 자동 입력 | 총무 박과장 |
| 10 | `10_월간청구서생성기.yaml` | 심화 | 전 개념 종합 | CSV → 고객별 한글 청구서 PDF 묶음 | 회계 김대리 |

## 강의 간 산출물 체인

학습자의 로컬 폴더에 강의별 산출물이 누적되어 다음 강의의 입력이 된다. **앞 강의 안 하면 다음이 안 된다**는 의존이 아니라 **앞 강의 산출물을 재사용하면 더 빨리·재미있게 진행된다**는 권장 체인:

```
01 (50개 PDF 일괄 메타 점검)
   └→ 02 (그 50개 중 일부를 단원별 분리·통합)
            └→ 03 (분리된 PDF에서 텍스트 추출)
03 ┐
04 ┴→ 06·07로 만든 새 PDF에 04 표 추출 결과를 표로 삽입 가능
05 (Hello PDF) → 06 (한글) → 07 (표/이미지) → 08 (워터마크/암호화) → 10 (청구서 통합)
                                                     ↑
                              09 (AcroForm 양식)는 별도 선택 트랙 — 10과 직접 결합 없음
```

각 강의 마지막 **확장 변주** 섹션에 "이 산출물을 N강 입력으로 써보세요" 안내. 이 체인이 트랙 전체를 한 프로젝트처럼 체감하게 만든다.

## 개념 분배 매트릭스

| 개념 | 01 | 02 | 03 | 04 | 05 | 06 | 07 | 08 | 09 | 10 |
|------|----|----|----|----|----|----|----|----|----|----|
| A. PdfReader | ✓ | ✓ | ✓ |   |   |   |   | ✓ | ✓ | ✓ |
| B. pages·metadata | ✓ |   |   |   |   |   |   | ✓ | ✓ | ✓ |
| C. PdfWriter.add_page |   | ✓ |   |   |   |   |   | ✓ |   | ✓ |
| D. PdfWriter.write |   | ✓ |   |   |   |   |   | ✓ |   | ✓ |
| E. extract_text |   |   | ✓ |   |   |   |   |   |   | ✓ |
| F. pdfplumber.open |   |   | ✓ | ✓ |   |   |   |   |   | ✓ |
| G. extract_tables |   |   |   | ✓ |   |   |   |   |   | ✓ |
| H. DataFrame 변환 |   |   |   | ✓ |   |   |   |   |   | ✓ |
| I. Canvas |   |   |   |   | ✓ |   |   | ✓ |   | ✓ |
| J. drawString·setFont |   |   |   |   | ✓ | ✓ |   |   |   | ✓ |
| K. TTFont 등록 |   |   |   |   |   | ✓ | ✓ | ✓ |   | ✓ |
| L. Paragraph·Style |   |   |   |   |   | ✓ | ✓ |   |   | ✓ |
| M. Platypus Table |   |   |   |   |   |   | ✓ |   |   | ✓ |
| N. Image |   |   |   |   |   |   | ✓ |   |   | ✓ |
| O. SimpleDocTemplate |   |   |   |   |   |   | ✓ |   |   | ✓ |
| P. encrypt |   |   |   |   |   |   |   | ✓ |   | ✓ |
| Q. watermark overlay |   |   |   |   |   |   |   | ✓ |   | ✓ |
| R. AcroForm 필드 |   |   |   |   |   |   |   |   | ✓ |   |
| TemporaryDirectory (공통) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| assert 검증 (공통) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

핵심 개념 모두 ≥3회 출현. R(AcroForm)은 09단독 — 입력 양식 자동화는 niche지만 인사·총무에 가치 커서 단독 강의 유지.

## 흔한 오개념 맵

학습자가 빠지는 함정과 해소 강의. 각 강의 yaml의 tip 또는 note 블록에 명시적 차단:

| # | 오개념 | 실제 | 해소 강의 |
|---|---|---|---|
| 1 | "pypdf로 한글 PDF 텍스트 깨끗하게 뽑힌다" | 폰트 임베드 안된 PDF는 깨진 char로 나옴 | 03 (pdfplumber 폴백) |
| 2 | "pypdf 페이지 좌표 = 화면 좌표" | PDF 좌표는 좌하단 (0,0) 기준 | 05 (Canvas 좌표계 tip) |
| 3 | "한글이 안 보이는 건 reportlab 버그" | TTFont 등록 안 한 게 99% | 06 (registerKoreanFont) |
| 4 | "extract_tables가 모든 표를 잡는다" | 선 없는 표·병합 셀은 못 잡거나 어긋남 | 04 (table_settings 튜닝 + 한계 솔직 명시) |
| 5 | "병합한 PDF는 폼·하이퍼링크 그대로 유지" | annotation은 pypdf 기본 동작에서 일부 손실 | 02 (note로 한계) |
| 6 | "encrypt하면 내용 자체가 암호화" | 메타데이터·일부 정보는 평문 잔존 | 08 (보안 한계 명시) |
| 7 | "워터마크는 텍스트 안으로 들어간다" | overlay는 시각적 위에 얹는 것, 추출 텍스트엔 추가됨 | 08 (구조 tip) |
| 8 | "PDF 양식 = AcroForm" | XFA 양식은 pypdf 미지원 | 09 (사전 식별 tip) |
| 9 | "Platypus가 Excel처럼 자동 줄바꿈" | 폭 지정 안 하면 페이지 밖으로 나감 | 07 (colWidths 의무) |
| 10 | "PDF 파일 크기 = 페이지 수에 비례" | 이미지 임베드가 압도적 비중 | 07 (이미지 압축 tip) |

## 트랙 간 결합점

PDF 트랙이 **고립되지 않도록** 다른 트랙과의 연결 지점을 PRD 단계에서 고정:

- **openpyxl ↔ PDF**: 04강(표 추출)에서 `pd.DataFrame` → `df.to_excel`로 openpyxl 04~10 입력으로 직결. 10강(청구서)은 openpyxl 10(월간 매출 리포트)의 데이터를 PDF로 변환하는 후속 단계.
- **pandas ↔ PDF**: 04강 산출물이 그대로 pandas 06(시계열)·09(merge)의 입력.
- **email ↔ PDF**: 10강 청구서 묶음이 email 10(주간 보고서 발송기)의 첨부 입력. `practical/`의 통합 시나리오 "데이터 → PDF → 메일"의 PDF 단계.
- **llmBasics ↔ PDF**: 03강(텍스트 추출) 출력이 llmBasics 04(구조화 출력)의 입력. "회의록 PDF → LLM 요약" 응용.

각 결합점은 해당 강의의 **확장 변주** 섹션에 명시.

## 확장 변주 카탈로그 (강의별 실습 후 응용)

각 강의는 expansion 미션 2개를 가지지만, **확장 변주 카탈로그** 5-7개로 학습자가 자기 업무에 적용할 길을 열어둠. 강의 yaml 마지막 섹션에 list 형태로:

**01강 확장:**
- 내 다운로드 폴더의 모든 PDF 메타 일괄 추출
- 페이지 수 N 이상인 PDF만 별도 폴더 이동
- 작성자별 PDF 그룹화

**04강 확장:**
- 국세청 부가세 신고서 → 분기별 합계 자동 계산
- 통계청 KOSIS PDF → 시계열 그래프
- 거래내역 PDF 100건 → 거래처별 합계

**10강 확장:**
- 청구서 + 메일 발송 통합 (email 트랙 연결)
- 청구서에 QR 결제 링크 삽입
- 청구서 발행 로그 → 엑셀 대시보드

전체 50+ 응용 아이디어가 트랙 전체에 흩어져 학습 후 **"그래서 나는 뭘 만들지"**에 답한다.

## 안전 정책

- 모든 결과 파일은 `tempfile.TemporaryDirectory()`. 사용자 폴더 오염 금지 (CLAUDE.md root-clean).
- `encrypt` 패스워드는 코드에 평문 금지. `os.environ` 또는 학습자가 입력하는 변수.
- 입력 PDF는 강의 시작에 reportlab으로 즉석 생성(자급자족) 또는 명시된 외부 URL. 학습자 로컬 PDF에 의존 금지.

## 한글 폰트 정책

`registerKoreanFont()` 헬퍼는 06강 첫 셀에 등장 후 06·07·08·10에서 재사용. 저장소에 ttf 미동봉. 폰트 미설치 시 `apt install fonts-nanum` (Linux), Windows·macOS는 기본 폰트 사용. 헬퍼 정의는 [한 줄 정의] 섹션의 코드 블록 참조.

## 실행 환경

- Python 3.12+ + `uv add pypdf pdfplumber reportlab`.
- 모든 강의 1회 실행 시간 **30초 이내** (10강 200건 청구서 포함). 학습 흐름 끊김 방지.

## 검증 계약 (모든 레슨 반복)

```python
import tempfile
from pathlib import Path
from pypdf import PdfReader

with tempfile.TemporaryDirectory() as tmp:
    outPath = Path(tmp) / "report.pdf"
    # ... PDF 생성 또는 조작 ...
    reader = PdfReader(outPath)
    assert len(reader.pages) == 3, "예상 페이지 수와 다릅니다"
    assert "월간 보고서" in reader.pages[0].extract_text()
```

생성 강의는 마지막에 `PdfReader`로 재오픈해 페이지/텍스트/메타 단위 assert.

## 레슨 yaml 작성 규약

- PRINCIPLES.md 검토 체크리스트 (line 657-680) 7항목 모두 통과.
- `meta.outcomes` / `meta.prerequisites` / `meta.estimatedMinutes` 직접 작성 — `_taxonomy.yml.lessonOutcomes`는 backfill 미사용.
- intro.diagram 4 step + 2 runtime, sections 5-6개 (step + summary), 각 section에 goal/why 필수.
- 실습은 expansion 미션 2개 (blocks 분리, 독립 실행 가능, import 포함).
- 새 개념 첫 등장 시 tip 1개 의무.
- **추가 (S급 기준)**:
  - intro.benefits 항목 중 1개는 ROI 매트릭스의 해당 행에서 가져온 시간 수치 명시.
  - 마지막 섹션 직전에 **흔한 오개념 맵**의 해당 행을 tip/note로 등장.
  - 마지막 섹션에 **확장 변주 카탈로그** 3-5개 list.

## 진척 검증

- `_taxonomy.yml`에 outcomes 9개(automation.pdf.*) + domain `pdfAutomation` 등록.
- `__init__.py`에 `pdf` 카테고리 등록 (5곳).
- `illustration.py` 카드 SVG (xlwings 패턴).
- 각 yaml PRINCIPLES.md 체크리스트 통과.
- `uv run python -X utf8 tests/run.py preflight` + `tests/testCurriculumOs.py` 통과.

## 남은 결정사항 (00 작성 진입 시 확인)

1. **04강 외부 PDF 출처**: 국세청·통계청 PDF를 `raw.githubusercontent.com/eddmpython/...` 같은 저장소에 사본으로 두고 raw URL 받을지, 자급자족(03·07에서 만든 PDF를 04 입력으로)으로 갈지. **권장: 자급자족 메인 + 외부 PDF는 확장 변주에서**.
2. **09강 AcroForm 샘플**: reportlab으로 AcroForm 양식 PDF 생성 가능. 자급자족 가능 확인.
3. **이미지 자산**: 07강의 로고, 10강의 직인 이미지는 svg 또는 작은 png를 `assets/`에 둘지, base64 인라인할지. **권장: assets/ 폴더 + .gitignore 미적용 작은 png**.
