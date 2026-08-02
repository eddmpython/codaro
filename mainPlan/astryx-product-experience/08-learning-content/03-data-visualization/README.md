# 03 Data Visualization

상태: 진행

## 목표

`dataVisualization`의 Python 변수·제어, pandas load, matplotlib basics·advanced, statistical·distribution·regression·heatmap outcome closure를 Web 시각화 경로로 만든다.

각 visual은 무엇을 읽어야 하는지 명시하고 실제 chart output을 보여 준다. capstone은 chart object 속성과 저장 이미지 descriptor를 함께 검증하며 이미지의 단순 존재나 pixel nonblank만으로 완료하지 않는다.

visualization 55개 레슨의 165개 assessment와 직접 검토는 승인됐다. 남은 blocker는 실제 학습자의 chart 판단, 접근성 description, Web 전이와 saved image 결과물 원본 증거다.

`seaborn/10_종합EDA리포트`의 CSV table 2개와 320x180 PNG image 2개는 기계 검증됐다. Local 졸업은 선택 사항이지만 실제 학습자 완주와 시각·접근성 검수 증거는 아직 없다.

## 영향 파일

- closure에 포함된 pandas, matplotlib, visualization YAML
- canonical content ledger에서 `ownerPacket=03-data-visualization`인 22개 레슨의 콘텐츠 이관과 review evidence
- packet 소유 `lesson-ledger.yml`, chart fixture, expected descriptor
- chart anatomy와 선택 기준 instructional visual manifest

## 영향 함수·심볼

- `checkImageArtifact`, `checkBehavior`, chart property normalizer
- browser canvas capture와 saved image descriptor

## 테스트

- axes, label, series, encoding, expected trend를 outcome에 맞게 검증
- retrieval/transfer에서 chart type 또는 dataset·제약이 달라짐
- light/dark와 320px에서 chart, alt summary, Lab result가 겹치지 않음
- `uv run python -X utf8 tests/run.py gate learning-content`

## 롤백

golden image 단독 비교에 의존하지 않는다. renderer 차이는 property descriptor와 허용 오차로 격리하고 레슨·fixture 단위로 되돌린다.

## 평가

차트를 그렸다는 사실이 아니라 데이터에 맞는 선택과 해석을 검증하고 경로 ledger와 canonical 소유 22개 행이 모두 승인될 때만 삭제 조건을 충족한다.
