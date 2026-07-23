# 05 Office Automation

상태: 진행

## 목표

`officeAutomation`의 Python 기초, pandas load·aggregate, Excel workbook·formula·style·conditional·chart·table·report outcome closure를 실제 workbook 결과물 경로로 만든다.

Web은 sandbox workbook 생성과 구조 검증을 제공하고 OS/Office 연동이 필요한 단계만 Local로 넘긴다. capstone은 sheet, cell formula, table, style rule, chart, report artifact를 구조적으로 검증한다.

현재 featured capstone `openpyxl/10_월간매출리포트생성기`는 reconciled, gap, unexpected-month 조건을 분리한 JSON table 3개를 만들고 대표 경로 aggregate의 `featured-capstone-contracts` machine 판정은 6/6이다. 이 경로는 Local 졸업 독립 증거가 pending이고 packet 소유 25개 canonical row의 사람 review와 실제 learner evidence도 완료되지 않았으므로 `_done`이 아니다.

## 영향 파일

- closure에 포함된 Python, pandas, Excel automation YAML
- canonical content ledger에서 `ownerPacket=05-office-automation`인 25개 레슨의 콘텐츠 이관과 review evidence
- packet 소유 `lesson-ledger.yml`, workbook fixtures, artifact descriptors
- workbook anatomy와 before/after instructional visual

## 영향 함수·심볼

- `checkTableArtifact`, `checkFileArtifact`, workbook descriptor normalizer
- browser workbook adapter, local Office capability adapter

## 테스트

- formula 결과와 formula source, sheet/table schema, conditional rule, chart reference 검증
- 손상 fixture, 재실행 idempotency, output overwrite 정책 검증
- Web archive를 Local에서 열어 같은 task와 progress를 이어감
- `uv run python -X utf8 tests/run.py gate learning-content`

## 롤백

fixture format과 library version을 evidence에 기록한다. output file은 임시 workspace에 만들고 사용자 파일을 덮어쓰는 test는 금지한다.

## 평가

보이는 workbook과 검증 descriptor가 함께 남고, 안전한 Web/Local 전환과 canonical 소유 25개 행의 review가 끝나야 `_done`이다.
