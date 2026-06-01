# xlwings 트랙 PRD

## 대상

Windows/macOS에 Microsoft Excel이 설치된 사용자가 **실행 중인 Excel을 Python으로 라이브 제어**하는 자동화를 배운다.
openpyxl 트랙(파일 기반, Excel 없이 동작)과는 의도적으로 분리한다.

## 두 트랙의 경계

| | openpyxl | xlwings |
|---|---|---|
| Excel 설치 필요 | ❌ | ✅ |
| 수식 결과 즉시 계산 | ❌ (다음 열기까지 미계산) | ✅ |
| 차트가 실제 보임 | 정의만 가능 | ✅ |
| VBA 매크로 호출 | ❌ | ✅ |
| UDF (사용자 정의 함수) | ❌ | ✅ |
| Linux/CI 환경 | ✅ | ❌ |
| 사용 시점 | 서버, 보고서 자동 생성 | 개인 PC 업무 자동화 |

## 10개 프로젝트 + 1 소개

| # | 파일 | 배지 | 핵심 개념 | 산출물 |
|---|------|------|----------|--------|
| 00 | `00_xlwings소개.yaml` | 소개 | App 계층, openpyxl과 경계 | 첫 connect smoke |
| 01 | `01_첫엑셀연결.yaml` | 입문 | A, B (App/Book/Sheet, 셀 R/W) | 빈 워크북에 셀과 한 줄 쓰기 |
| 02 | `02_가격표일괄입력.yaml` | 입문 | C, D, S (2D Range, expand, bulk perf) | 상품 가격표 2D 일괄 입력 |
| 03 | `03_시트탐색과확장.yaml` | 기초 | F, D (sheets 컬렉션, expand("table")) | 자동 인식되는 표 영역 탐색 |
| 04 | `04_DataFrame왕복.yaml` | 기초 | E, S (options 컨버터, 양방향 변환) | pandas DataFrame ↔ Excel |
| 05 | `05_수식과서식.yaml` | 기초 | G, H (formula, number_format, color) | 자동 합계와 통화 서식 |
| 06 | `06_막대차트자동생성.yaml` | 중급 | I (charts.add, chart.set_source_data) | 매출 막대 차트 생성/갱신 |
| 07 | `07_표와동적합계.yaml` | 중급 | J (tables.add ListObject) | Excel 표 + 합계행 자동 |
| 08 | `08_월별파일분기합치기.yaml` | 중급 | K (다중 워크북 열기/닫기) | 12개월 파일 → 분기 통합 |
| 09 | `09_VBA매크로호출.yaml` | 심화 | L, M (book.macro, RunPython) | Python에서 VBA 호출 |
| 10 | `10_UDF가격계산기.yaml` | 심화 | N + 종합 | @xw.func UDF + 일일 보고서 봇 |

## 개념 분배 매트릭스

| 개념 | 01 | 02 | 03 | 04 | 05 | 06 | 07 | 08 | 09 | 10 |
|------|----|----|----|----|----|----|----|----|----|----|
| A. App/Book/Sheet 수명주기 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| B. 셀 R/W (`range.value`) | ✓ | ✓ | ✓ |   |   |   |   |   |   | ✓ |
| C. 2D Range 일괄 쓰기 |   | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |   | ✓ |
| D. `expand("table")` |   | ✓ | ✓ | ✓ |   | ✓ |   | ✓ |   | ✓ |
| E. `options()` 컨버터 |   |   |   | ✓ | ✓ |   | ✓ | ✓ |   | ✓ |
| F. sheets 컬렉션 |   |   | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| G. Formula 작성 |   |   |   |   | ✓ |   | ✓ |   |   | ✓ |
| H. 셀 서식 |   |   |   |   | ✓ | ✓ | ✓ |   |   | ✓ |
| I. Chart |   |   |   |   |   | ✓ |   |   |   | ✓ |
| J. Table (ListObject) |   |   |   |   |   |   | ✓ |   |   | ✓ |
| K. 다중 워크북 |   |   |   |   |   |   |   | ✓ |   | ✓ |
| L. VBA macro 호출 |   |   |   |   |   |   |   |   | ✓ |   |
| M. RunPython 패턴 |   |   |   |   |   |   |   |   | ✓ | ✓ |
| N. UDF (`@xw.func`) |   |   |   |   |   |   |   |   |   | ✓ |
| S. Bulk R/W 성능 |   | ✓ |   | ✓ |   |   |   | ✓ |   | ✓ |
| with App 컨텍스트 (공통) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

## 실행 환경

- xlwings는 Excel 본체를 제어한다. **로컬 PC에 Excel 설치 필수**.
- 모든 레슨은 `with xw.App(visible=False) as app:` 패턴으로 시작. 좀비 Excel 프로세스 방지.
- 결과 파일은 `TemporaryDirectory()`로 임시 생성. CLAUDE.md 루트 청결 규칙.
- 패키지: `xlwings` (`meta.packages`와 라이브러리 패널 기준)

## 핵심 안전 패턴 (모든 레슨 반복)

```python
import xlwings as xw

with xw.App(visible=False) as app:
    book = app.books.add()
    sheet = book.sheets.active
    sheet["A1"].value = "Hello"
    book.save(savePath)
# with 종료 시 자동으로 book.close + app.quit
```

## 진척 검증

- `_taxonomy.yml`에 lessonOutcomes 11개 등록
- `__init__.py`에 `xlwings` 카테고리 등록 (categoryMapping/categoryMeta/categoryGroups/categoryTree/learningPaths)
- `illustration.py`로 카테고리 카드용 SVG 제공
- 각 yaml 파일은 PRINCIPLES.md 검토 체크리스트 통과
- `tests/run.py preflight` 통과
