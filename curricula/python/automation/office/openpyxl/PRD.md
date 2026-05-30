# openpyxl 학습 콘텐츠 PRD

## 목표

- Excel 앱이 없는 환경(서버, CI, Linux, macOS)에서도 `.xlsx` 파일을 만들고 읽는 자동화 능력을 끝까지 만든다.
- 사람이 매월 손으로 만들던 보고서를 한 함수 호출로 재현할 수 있게 한다.
- 표·수식·서식·차트·검증·이미지까지 openpyxl의 모든 핵심 능력을 한 트랙에서 다룬다.

## 타겟 독자

- Python 기초(함수, dict, 파일 입출력)는 있는데 엑셀 자동화는 처음인 사람
- pandas의 `to_excel`로는 부족한 보고서 양식이 필요한 분석가
- Excel 매크로/xlwings로는 서버에서 못 돌리는 보고서를 자동화하고 싶은 실무자
- 사용자에게 받는 입력 양식을 코드로 검증하고 싶은 자동화 담당자

## 도구 선택의 자리

| 도구 | 강점 | 한계 | 언제 |
|------|------|------|------|
| **openpyxl** | 파일 자체를 직접 생성·수정. Excel 앱 불필요. 서버·CI 어디서나 동작 | 수식을 자체 계산 못함. 일부 차트 옵션 제한 | 양식 자동 생성, 다중 시트 보고서, 입력 양식 |
| pandas.to_excel | DataFrame 출력이 한 줄 | 차트·서식·다중 시트 거의 못 다룸 | 단순 데이터 저장 |
| xlwings | 살아 있는 Excel을 실시간 조작. VBA 호환 | Excel 설치 필수. 서버 자동화 불가 | 사용자 데스크탑 Excel 보조 |
| win32com | Excel 자동화 + 매크로 호출 | Windows + Excel 필수. 서버에서 무리 | 매크로 보존 필수일 때 |

이 커리큘럼은 **openpyxl을 서버 자동화의 기본**으로 자리매김한다.

## 10 프로젝트 구조

| # | 강의 | 산출물 | 사용 능력 |
|---|------|--------|-----------|
| 00 | 소개 | 학습 지도 + 도구 선택 가이드 | - |
| 01 | 워크북과 시트 만들기 | 다중 시트 빈 보고서 양식 | Workbook · create_sheet · save · load |
| 02 | 셀 읽기와 쓰기 | 통계 dict → 정렬된 셀 표 | cell · `[A1]` · append · 좌표 변환 |
| 03 | 범위와 다중 시트 | 카테고리별 분리 보고서 | iter_rows · 범위 슬라이스 · merge_cells |
| 04 | 수식과 이름 영역 | 수식 기반 인보이스 | SUM/IF/VLOOKUP · DefinedName · data_only |
| 05 | 셀 서식과 숫자 포맷 | 스타일링된 매출 보고서 헤더 | Font/Fill/Border/Alignment · NamedStyle |
| 06 | 조건부 서식 | KPI 신호등 대시보드 | ColorScale · DataBar · CellIs · FormulaRule |
| 07 | 차트 삽입 | 지역별 매출 차트 묶음 | BarChart · LineChart · PieChart · Reference |
| 08 | 이미지와 하이퍼링크 | 이미지 포함 상품 카탈로그 | add_image · cell.hyperlink · Comment |
| 09 | 표와 데이터 검증 | 드롭다운 검증된 주문 양식 | Table · TableStyleInfo · DataValidation · freeze_panes |
| 10 | 월간 매출 리포트 생성기 | CSV → 다중 시트 완성 보고서 | 전 강의의 모든 능력 통합 |

## 개념 분배 매트릭스 (각 개념 최소 3회 반복)

| 개념 | 01 | 02 | 03 | 04 | 05 | 06 | 07 | 08 | 09 | 10 |
|------|----|----|----|----|----|----|----|----|----|----|
| Workbook · save · load | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| TemporaryDirectory | ✓ |   | ✓ | ✓ | ✓ | ✓ |   |   |   | ✓ |
| append · iter_rows |   | ✓ | ✓ |   | ✓ | ✓ | ✓ |   | ✓ | ✓ |
| 다중 시트 | ✓ |   | ✓ | ✓ | ✓ |   |   | ✓ |   | ✓ |
| 수식 (=SUM/IF/VLOOKUP) |   |   |   | ✓ |   |   |   |   |   | ✓ |
| Font/Fill/Border |   |   |   |   | ✓ | ✓ |   |   |   | ✓ |
| NamedStyle |   |   |   |   | ✓ |   |   |   |   | ✓ |
| number_format |   |   |   |   | ✓ |   |   |   | ✓ | ✓ |
| 조건부 서식 |   |   |   |   |   | ✓ |   |   |   | ✓ |
| 차트 (Bar/Line/Pie) |   |   |   |   |   |   | ✓ |   |   | ✓ |
| 이미지 / 하이퍼링크 |   |   |   |   |   |   |   | ✓ |   |   |
| Table · DataValidation |   |   |   |   |   |   |   |   | ✓ | ✓ |
| freeze_panes |   |   |   |   |   |   |   |   | ✓ | ✓ |
| `assert` 재오픈 검증 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

## 학습 계약

1. **로컬 격리 우선** — 모든 강의는 `TemporaryDirectory` 안에서 동작하므로 학습자의 로컬 디스크를 어지럽히지 않는다.
2. **재오픈 검증 필수** — 모든 강의는 마지막 단계에 `load_workbook`로 재오픈해 `assert`로 결과를 코드 검증한다. 눈으로 보고 끝나지 않는다.
3. **structured 섹션 일관성** — 모든 단계는 snippet → exercise → check 3종 계약을 채운다. 학습자가 단계마다 변경 지점 한 곳을 직접 바꿔 실험한다.
4. **종합 실습(미션 2개)** — 각 강의 끝에 import부터 검증까지 독립 실행 가능한 미션 2개를 expansion 블록으로 제공한다. 첫 미션은 그 강의의 핵심 기술 단독 적용, 두 번째 미션은 이전 강의 누적 기술과 결합한 분석/비교 형 작업.
5. **함정·한계 명시** — API 나열이 아니라 자주 만나는 함정(빈 기본 시트, 수식 캐시 None, 1-based 좌표, NamedStyle immutable, displayName 유일성, $ 위치, fill_type 누락)을 명시적으로 다룬다.

## 도메인과 outcome 매핑

타겟 도메인은 `officeAutomation`이고, 11강이 다음 outcome을 모두 채운다.

- `automation.excel.intro` — 00, 01
- `automation.excel.workbook` — 01, 02, 03
- `automation.excel.formulas` — 04
- `automation.excel.styles` — 05
- `automation.excel.conditional` — 06
- `automation.excel.charts` — 07
- `automation.excel.images` — 08
- `automation.excel.tables` — 09
- `automation.excel.report` — 10

## 실무 시나리오 매핑

| 실무 상황 | 추천 강의 묶음 |
|-----------|----------------|
| 매월 같은 양식의 보고서를 자동 생성 | 01 → 02 → 04 → 05 → 10 |
| 사용자가 채우는 입력 양식 만들기 | 01 → 02 → 09 |
| 지역·상품·요일별 KPI 대시보드 | 01 → 03 → 05 → 06 → 07 |
| 다중 시트 정산서 자동 생성 | 01 → 03 → 04 → 05 → 09 → 10 |
| 상품 카탈로그 / 첨부 양식 | 01 → 02 → 05 → 08 |

## 다음 확장 후보

- `openpyxl/11_대용량과메모리효율` — `write_only` / `read_only` 모드, 100만 행 다루기
- `openpyxl/12_인쇄와페이지설정` — print_area, page_margins, header/footer
- `openpyxl/13_엑셀템플릿채우기` — 사용자가 만든 .xlsx 템플릿에 데이터만 채우기
- 자동화 인프라와의 통합은 `automation/os/watchSched/` 트랙과 결합
