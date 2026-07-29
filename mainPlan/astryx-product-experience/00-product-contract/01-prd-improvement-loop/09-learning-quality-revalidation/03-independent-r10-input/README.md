# 03 Independent R10 Input

상태: 차단

## 목표

작성자의 목표 점수와 과거 결론을 배제하고 current commit의 원본 구현 증거만 독립 평가자에게 제출한다.

00~02의 current commit 증거가 닫힌 뒤에만 입력 manifest를 만든다. 이전 평가 점수·결론·remediation은 blind evaluator에게 제공하지 않는다. machine report, 브라우저 결과, 사람 검수, source hash, commit hash의 원본만 봉인하고 신규 평가자 3명이 독립적으로 판단한다.

현재 공식 `product-experience-browser` 83/83과 `local-studio-browser` 28/28은 green이고 Day 19 archive flow, canonical mastery 수정과 lessonRef 기반 시각 자료 배선도 이 matrix에 포함됐다. 설치형 네이티브 WebView2도 9/9를 통과하며 current source commit과 직접 연결된다. R10 bundle은 허용 목록의 machine report 9개와 report가 참조하는 JSON·이미지만 `evaluation-evidence/`에 복제하고 원본 byte SHA-256, source commit, read-only ZIP entry를 함께 봉인한다. 일반 `output`, 이전 점수·결론, 개선 loop history는 계속 제외된다.

그러나 identity/content 승인 각 0/472, taxonomy 승인 0/7, independent assessment 승인 0/468, 수동 접근성 0/6, 사용자 연구 0/12, 제품 디자인·접근성 독립 검토 0/2다. 신규 평가자 3명의 독립 R10 raw report와 current sealed bundle도 없다. 따라서 차단 상태이며 TODO가 남아 있다.

## 영향 파일

- `mainPlan/astryx-product-experience/00-product-contract/01-prd-improvement-loop/08-r10-independent-review/`
- `docs/skills/ops/tools/buildPrdEvaluationBundle.py`
- `output/test-runner/product-experience-browser/product-experience-report.json`
- `output/test-runner/curriculum-top-tier-audit/curriculum-top-tier-report.json`
- `tests/product/testPrdEvaluationBundle.py`
- `tests/product/testPrdEvaluationReport.py`

## 영향 함수·심볼

- `PrdEvaluationReport`, `EvidenceMaturity`, evaluator manifest hash

## 테스트

- evaluator identity 3개와 remediation author 불일치
- raw machine report·참조 artifact·scope hash·rubric hash·git head freshness
- stale report, 허용 목록 밖 output, dirty source scope의 seal 차단
- `uv run python -X utf8 tests/run.py gate plan-quality`

## 롤백

입력 누출이나 hash 불일치가 발견되면 평가를 폐기하고 새 evaluator로 새 round를 만든다. 이전 round를 수정하거나 삭제하지 않는다.

## 평가

### 개발자 관점

manifest가 current commit과 모든 machine artifact의 hash를 검증해야 한다.

### PM 관점

낮은 점수도 그대로 제품 판단 자료다. 원하는 결론을 얻기 위한 재채점은 금지한다.
