# Word 트랙 PRD

## 한 줄 정의

근로계약서·회의록·가정통신문·제안서 같은 **양식화된 docx**를 데이터에서 자동 생성한다. mail merge가 핵심.

## 페르소나와 도착점

| 페르소나 | 주간 Word 작업 | 이 트랙 졸업 시 산출물 |
|---|---|---|
| HR 인사담당자 | 신입사원 N명의 근로계약서 양식 채우기 + 직인·서명란 | 08·09강 — CSV → 근로계약서 N장 자동 생성 |
| 영업 박과장 | 제안서 양식에 고객사명·금액·일정 매번 손으로 교체 | 07·09강 — docxtpl 템플릿 + Jinja for-loop |
| 학교 행정 김선생님 | 가정통신문 200명 학생별 발송 (학생이름·반·번호) | 08강 — mail merge 패턴 |
| 컨설팅 이대표 | 매주 고객 회의 후 회의록 양식 채우기 (참석자·결정사항·액션아이템) | 10강 — 회의 메모 JSON → 양식 회의록 docx |

## ROI 매트릭스

| # | 강의 | 수동 (N=20건) | 자동 (1회) | 비고 |
|---|---|---|---|---|
| 04 | 비교표 작성 | 30분 | 5초 | 4×N 표 일괄 |
| 07 | 기존 docx 자리표시자 치환 | 20건 × 5분 = 100분 | 3초 | `{이름}` 단순 치환 |
| 08 | mail merge (가정통신문 200건) | 200건 × 3분 = 10시간 | 30초 | CSV 순회 + 파일명 패턴 |
| 09 | docxtpl 제안서 | 5건 × 30분 = 150분 | 10초 | Jinja 템플릿 |
| 10 | 회의록 자동 생성 | 주 1회 × 40분 | 8초 | JSON → 양식 docx |

총합 기준 주간 **5시간 이상** 절감 (HR/학교 행정은 월 단위로 더 큼).

## 라이브러리 경계와 결정 근거

| 라이브러리 | 역할 | 사용 강의 | 라이선스 |
|---|---|---|---|
| `python-docx` | 단락, 표, 이미지, 스타일, 머리말/꼬리말 | 01-10 | MIT |
| `docxtpl` | Jinja2 기반 템플릿 채우기 | 09·10 | LGPL |

**왜 2개:**
- `python-docx`만으로 90% 가능. mail merge 같은 **템플릿 → 데이터 주입**은 `docxtpl`이 압도적 깔끔.
- 보완 관계 — 09·10에서 둘 다 같은 흐름에 호출.

**대안 비교:**
- `pywin32`(Win32 COM) → Windows 전용, Word 앱 필요. portability ↓. 회피.
- `mammoth` → docx → HTML 변환 특화. 생성 용도 아님. 회피.
- LibreOffice headless + Python uno → 무거움. 회피.

## python-docx의 한계 (PRD 레벨 사전 고지)

학습자가 막혔을 때 빠지지 않도록:

- **목차(TOC) 자동 생성 불가** → docx에 TOC 필드만 삽입 + 사용자가 Word에서 "필드 업데이트". 본 트랙은 다루지 않음.
- **동적 페이지번호** → sections.header에 단순 텍스트는 가능, 동적 번호는 XML 직접 편집 → 05에서 한 번 패턴만.
- **수식·차트·추적변경(track changes)** → 미지원. 다루지 않음. 차트는 matplotlib png → `add_picture` 권장.
- **한글 글꼴은 East Asian font 별도 설정** → `run.font.name = "맑은 고딕"`만으론 한글 미적용. `rPr.rFonts.set(qn("w:eastAsia"), ...)` 패턴 03에 의무 tip.

00 소개에 "이 트랙이 다루지 않는 것" 섹션으로 솔직히 명시.

## 한국 사무환경 특화 (kr-specific)

- **04강 표**: 한국식 보고서의 가로형 표 (좌 라벨 + 우 값). cell merge로 헤더 병합 패턴.
- **05강 머리말**: "주식회사 OOO" + 페이지번호 "1 / 5" 한국식.
- **06강 스타일**: 한국 공문서 표준 글꼴(맑은 고딕 10pt, 줄간격 160%) 양식 정의.
- **07강 자리표시자**: 한국 근로계약서 양식에 흔한 `{성명}`, `{생년월일}`, `{입사일}`, `{연봉}` 필드.
- **08강 mail merge**: 학교 가정통신문 (학생명·학년·반·번호·학부모명·연락처) 한국 학교 표준 항목.
- **09강 docxtpl**: 한국 영업 제안서 양식 (고객사·담당자·견적 항목 for-loop · 합계 · 부가세 별도).
- **10강 회의록**: 한국 컨설팅 회의록 양식 (일시·장소·참석자·안건·결정사항·액션아이템 + 차기 회의일).

## 한글 처리 (필수 패턴)

docx는 시스템에 설치된 한글 폰트를 자동 사용. 단 East Asian font 별도 설정:

```python
from docx.oxml.ns import qn
run.font.name = "맑은 고딕"
run._element.rPr.rFonts.set(qn("w:eastAsia"), "맑은 고딕")
```

이 패턴이 빠지면 한글 부분이 기본 영문 폰트로 렌더링되어 보기 흉함. 03강에 의무 tip + 06강 스타일 정의 함수에 흡수.

## 10 프로젝트 + 1 소개

| # | 파일 | 배지 | 핵심 개념 | 산출물 | 페르소나 |
|---|------|------|---------|------|------|
| 00 | `00_word소개.yaml` | 소개 | python-docx vs docxtpl 경계, 다루지 않는 것 | 환경 점검 | 전체 |
| 01 | `01_첫문서만들기.yaml` | 입문 | A, B (Document, add_paragraph, save) | "Hello docx" | 전체 |
| 02 | `02_제목과목록.yaml` | 입문 | C, D (add_heading, List Bullet/Number) | 보고서 목차 골격 | 전체 |
| 03 | `03_텍스트스타일링.yaml` | 기초 | E, F (run, font + East Asian) | 한글 강조 문단 | 전체 |
| 04 | `04_표만들기.yaml` | 기초 | G, H (add_table, cell, merge_cells) | 비교표 3×4 | 컨설팅 이대표 |
| 05 | `05_이미지와머리말.yaml` | 기초 | I, J (add_picture, sections header/footer) | 로고+페이지번호 | HR 인사담당자 |
| 06 | `06_스타일과페이지설정.yaml` | 중급 | K, L (styles.add_style, Pt/Inches, page_margins) | 사내 양식 스타일 정의 | HR 인사담당자 |
| 07 | `07_기존문서수정.yaml` | 중급 | M, N (Document(path), 단락 순회, 텍스트 치환) | `{성명}` 등 자리표시자 치환 | 영업 박과장 |
| 08 | `08_mailmerge_csv기반.yaml` | 중급 | O (CSV 순회 → 다수 docx, 파일명 패턴) | 가정통신문 200건 | 학교 행정 김선생님 |
| 09 | `09_docxtpl템플릿엔진.yaml` | 심화 | P (docxtpl render, Jinja {{ }}, {% for %}) | 영업 제안서 (for-loop 견적표) | 영업 박과장 |
| 10 | `10_회의록자동생성기.yaml` | 심화 | 전 개념 종합 | 회의 메모 JSON → 회의록 docx | 컨설팅 이대표 |

## 강의 간 산출물 체인

```
01 (Hello docx) → 02 (목차) → 03 (한글 스타일) → 04 (표) → 05 (로고/머리말)
                                                              ↓
                                                       06 (양식 스타일 함수)
                                                              ↓
07 (자리표시자 치환) ─────────────────────────────────────→ 08 (CSV mail merge)
                                                              ↓
                                                       09 (docxtpl)
                                                              ↓
                                                       10 (회의록 종합 = 03·04·05·06·09 결합)
```

06강의 "양식 스타일 정의 함수"가 07·08·10에서 재사용. 학습자가 만든 스타일이 후속 강의에서 살아 있음을 체감.

## 개념 분배 매트릭스

| 개념 | 01 | 02 | 03 | 04 | 05 | 06 | 07 | 08 | 09 | 10 |
|------|----|----|----|----|----|----|----|----|----|----|
| A. Document() | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| B. add_paragraph·save | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |   | ✓ |
| C. add_heading |   | ✓ |   |   |   | ✓ |   | ✓ |   | ✓ |
| D. List Bullet/Number |   | ✓ |   |   |   | ✓ |   |   |   | ✓ |
| E. Run·font |   |   | ✓ |   |   | ✓ |   |   |   | ✓ |
| F. East Asian font |   |   | ✓ |   |   | ✓ |   |   |   | ✓ |
| G. add_table |   |   |   | ✓ |   |   |   |   |   | ✓ |
| H. cell·merge_cells |   |   |   | ✓ |   |   |   |   |   | ✓ |
| I. add_picture |   |   |   |   | ✓ |   |   |   |   | ✓ |
| J. sections·header/footer |   |   |   |   | ✓ |   |   |   |   | ✓ |
| K. styles.add_style |   |   |   |   |   | ✓ |   | ✓ |   | ✓ |
| L. Pt·Inches·margins |   |   |   |   |   | ✓ |   |   |   | ✓ |
| M. Document(path) 열기 |   |   |   |   |   |   | ✓ | ✓ |   | ✓ |
| N. 텍스트 치환 |   |   |   |   |   |   | ✓ | ✓ |   |   |
| O. CSV mail merge |   |   |   |   |   |   |   | ✓ |   |   |
| P. docxtpl render |   |   |   |   |   |   |   |   | ✓ | ✓ |
| TemporaryDirectory (공통) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| assert 검증 (공통) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

## 흔한 오개념 맵

| # | 오개념 | 실제 | 해소 강의 |
|---|---|---|---|
| 1 | "한글 폰트는 자동으로 잡힌다" | East Asian font 별도 설정 안 하면 기본 영문 폰트 | 03 |
| 2 | "doc.paragraphs[0].text = ..." 가 텍스트 수정 | text는 read-only 속성. run을 새로 만들거나 기존 run 수정 | 07 |
| 3 | "merge_cells 후 텍스트 입력하면 자동 가운데 정렬" | 정렬은 별도 설정 필요 | 04 |
| 4 | "add_picture 폭 지정 안 하면 원본 크기" | True. 큰 원본은 페이지 밖으로 나감. width 지정 권장 | 05 |
| 5 | "기존 docx 표는 add_table로 추가됨" | tables 컬렉션의 cell()로 접근. add는 새 표만 | 07 |
| 6 | "스타일 이름은 무엇이든 가능" | 한글·공백 포함 가능하나 충돌 위험. 영문 권장 | 06 |
| 7 | "docxtpl이 모든 Jinja 기능 지원" | for/if는 OK, 일부 필터는 미지원 | 09 |
| 8 | "Subdoc 합치면 머리말/꼬리말 보존" | 보존 안 됨. master에서 정의 | 10 |
| 9 | "docx 저장 후 바로 PDF 변환 됨" | python-docx 자체는 PDF 출력 없음. LibreOffice headless 또는 별도 도구 | 10 (PDF 트랙 결합 안내) |
| 10 | "Document(path) 후 paragraphs는 즉시 반영" | 일부 XML 조작은 새 객체 생성 필요 | 07 |

## 트랙 간 결합점

- **PDF ↔ Word**: 10강 회의록 docx → PDF 변환은 본 트랙 범위 밖. PDF 트랙 06·07 패턴으로 회의록 내용을 reportlab으로 다시 그리거나, **LibreOffice headless 변환** 한 줄 안내(`soffice --headless --convert-to pdf`).
- **Email ↔ Word**: 08강 mail merge 결과를 email 트랙 03(개인화 발송)으로 첨부 발송. 가정통신문 → 학부모 메일 자동.
- **pandas ↔ Word**: 08강 CSV 입력을 pandas로 전처리 후 docx 생성. 데이터 정제 + 문서 생성 결합.
- **openpyxl ↔ Word**: 회사 양식 정의를 docx + xlsx 둘 다 만드는 사례 (사내 양식 패키지).
- **llmBasics ↔ Word**: 10강 회의 메모 JSON 입력을 LLM으로 자동 추출(녹음 → 텍스트 → 구조화 메모 → docx) 확장.

## 확장 변주 카탈로그

**04강 확장:**
- 직원 명단표 (이름·부서·직급·연락처)
- 결재 라인 표 (담당·검토·승인)
- 견적 항목표 (품목·수량·단가·합계 자동 계산)

**08강 확장:**
- 근로계약서 N장
- 표창장 N장
- 거래처 정기 안내문

**10강 확장:**
- 회의록 → 액션아이템만 추출해 별도 docx (todo 목록)
- 회의록 → 이메일로 자동 공유 (email 트랙 연결)
- 회의록 → 캘린더 ics (다음 회의 일정 자동 등록)

## 안전 패턴 (모든 레슨)

```python
import tempfile
from pathlib import Path
from docx import Document

with tempfile.TemporaryDirectory() as tmp:
    outPath = Path(tmp) / "report.docx"
    doc = Document()
    doc.add_heading("월간 보고서", level=1)
    doc.add_paragraph("내용입니다.")
    doc.save(outPath)

    reopened = Document(outPath)
    assert reopened.paragraphs[0].text == "월간 보고서"
    assert reopened.paragraphs[1].text == "내용입니다."
```

## 실행 환경

- Python 3.12+ + `uv add python-docx docxtpl`.
- 모든 결과 `tempfile.TemporaryDirectory()`. 다시 `Document(path)`로 열어 assert.

## 레슨 yaml 작성 규약

PDF/Email 트랙과 동일 + S급 추가:
- intro.benefits 1개에 ROI 매트릭스 시간 수치.
- 마지막 섹션 직전에 흔한 오개념 맵 해당 행 tip/note.
- 마지막 섹션에 확장 변주 3-5개 list.

## 진척 검증

- `_taxonomy.yml`에 outcomes 10개(automation.word.*) + domain `documentAutomation` 등록.
- `__init__.py`에 `word` 카테고리 등록 (5곳).
- `illustration.py` 카드 SVG.
- `tests/run.py preflight` + `tests/testCurriculumOs.py` 통과.

## 남은 결정사항

1. **07강 자리표시자 형식**: 단순 `{성명}` vs `{{name}}` Jinja 스타일. **권장: `{{name}}`** — 07에서 단순 문자열 치환의 한계를 보여주고 09 docxtpl에서 같은 문법을 우아하게 처리하는 흐름.
2. **10강 회의록 깊이**: 회의록 단일 vs 회의록 + 계약서 종합. **권장: 회의록 단일**. 계약서는 09 docxtpl 확장 변주로.
3. **docx → PDF 변환 안내**: 본 트랙 범위 밖. 10강 마지막 tip으로 LibreOffice headless 패턴 한 줄. **권장: 확정**.
