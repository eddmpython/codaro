# 07 Remaining Domains

상태: 설계

## 목표

대표 6경로에서 검증된 identity, 레슨 구조, strong check, evidence, visual 계약을 taxonomy의 나머지 모든 domain에 레슨별로 적용해 전체 472개 ledger를 닫는다.

domain을 risk와 prerequisite graph 기준으로 작은 review packet으로 나누되 자동 YAML 생성과 일괄 문구 치환은 금지한다. 각 레슨은 사람이 읽고 실행하고 retrieval·transfer 결과를 확인한 뒤에만 ledger를 승인한다.

## Domain packet map

- [pdfAutomation](00-pdf-automation/), [emailAutomation](01-email-automation/), [documentAutomation](02-document-automation/), [scriptingAutomation](03-scripting-automation/)
- [timeSeriesAnalysis](04-time-series-analysis/), [interactiveDashboards](05-interactive-dashboards/), [geoVisualization](06-geo-visualization/), [statisticalAnalysis](07-statistical-analysis/)
- [machineLearning](08-machine-learning/), [timeSeriesForecasting](09-time-series-forecasting/), [graphAnalysis](10-graph-analysis/), [imageProcessing](11-image-processing/)
- [computerVision](12-computer-vision/), [visionAdvanced](13-vision-advanced/), [deepLearningVision](14-deep-learning-vision/), [visionAutomation](15-vision-automation/)
- [textProcessing](16-text-processing/), [scientificComputing](17-scientific-computing/), [sqlAnalysis](18-sql-analysis/), [bigDataPipelines](19-big-data-pipelines/)
- [dataContracts](20-data-contracts/), [desktopAutomation](21-desktop-automation/), [systemMonitoring](22-system-monitoring/), [standardLibraryMastery](23-standard-library-mastery/), [aiIntegration](24-ai-integration/)

각 domain folder의 `lesson-ledger.yml`은 현재 `planComposer` closure의 membership과 canonical content reference를 소유한다. 실제 lesson requirement와 source owner는 `../00-identity-integrity/content-ledger/`의 472 unique row만 가진다. 25개 domain packet이 모두 이 folder의 `_done/`으로 이동되기 전에는 `07-remaining-domains`도 완료가 아니다.

## 영향 파일

- 대표 6경로 밖의 `curricula/python/**/*.yaml`
- 위 25개 domain folder의 `lesson-ledger.yml`, fixture, visual manifest, review evidence
- taxonomy outcome와 misconception approval catalog

## 영향 함수·심볼

- `composeMasterPlan`, `CheckSpec`, `RetrievalTaskVariant`, `ArtifactDescriptor`
- domain별 browser/local check adapter와 approved misconception matcher

## 테스트

- canonical content 472행과 path membership reference의 identity·metadata·prerequisite·tier·check strength matrix
- 필수 mission weak-only 0, prediction 0, orphan visual 0, unreviewed ledger 0
- domain별 unseen retrieval/transfer smoke와 capstone artifact 검증
- `uv run python -X utf8 tests/run.py gate learning-content`

## 롤백

domain 안에서도 한 레슨 또는 review 가능한 작은 closure 단위 commit을 사용한다. 대표 경로 gate를 깨는 공통 contract 변경은 먼저 원래 패킷에서 재승인한다.

## 평가

“전체 적용” 보고서만으로 완료하지 않는다. 472개 모든 ledger 행에 reviewer, evidence commit, current content hash가 있어야 `_done`이다.
