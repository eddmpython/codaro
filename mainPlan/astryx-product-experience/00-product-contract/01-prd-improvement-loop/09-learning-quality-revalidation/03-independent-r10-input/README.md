# 03 Independent R10 Input

상태: 차단

## 목표

작성자의 목표 점수와 과거 결론을 배제하고 current commit의 원본 구현 증거만 독립 평가자에게 제출한다.

00~02의 current commit 증거가 닫힌 뒤에만 입력 manifest를 만든다. 이전 평가 점수·결론·remediation은 blind evaluator에게 제공하지 않는다. machine report, 브라우저 결과, 사람 검수, source hash, commit hash의 원본만 봉인하고 신규 평가자 3명이 독립적으로 판단한다.

현재 공식 `product-experience-browser` 63/63과 `local-studio-browser` 26/26은 green이고 Day 19 archive flow와 canonical mastery 수정도 이 matrix에 포함됐다. 그러나 실제 WebView2, identity/content 승인 각 0/472, taxonomy 승인 0/7, independent assessment 승인 0/467, 신규 평가자 3명의 독립 R10 raw report와 current sealed bundle이 없다. 따라서 차단 상태이며 `_done`이 아니다.

## 영향 파일

- `mainPlan/astryx-product-experience/00-product-contract/01-prd-improvement-loop/08-r10-independent-review/`
- `output/test-runner/product-experience-browser/product-experience-report.json`
- `output/test-runner/curriculum-top-tier-audit/curriculum-top-tier-report.json`
- `tests/product/testPrdEvaluationReport.py`

## 영향 함수·심볼

- `PrdEvaluationReport`, `EvidenceMaturity`, evaluator manifest hash

## 테스트

- evaluator identity 3개와 remediation author 불일치
- raw report·scope hash·rubric hash·git head freshness
- `uv run python -X utf8 tests/run.py gate plan-quality`

## 롤백

입력 누출이나 hash 불일치가 발견되면 평가를 폐기하고 새 evaluator로 새 round를 만든다. 이전 round를 수정하거나 삭제하지 않는다.

## 평가

### 개발자 관점

manifest가 current commit과 모든 machine artifact의 hash를 검증해야 한다.

### PM 관점

낮은 점수도 그대로 제품 판단 자료다. 원하는 결론을 얻기 위한 재채점은 금지한다.
