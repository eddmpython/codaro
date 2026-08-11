---
id: reference-products
title: Reference product 계약
description: 다섯 실제 Percent Python 제품으로 browser, server, local의 작성, 실행, 배포와 claim 경계를 함께 검증한다.
category: architecture
section: reference
order: 219
purpose: 개별 unit test를 넘어 사용자가 받는 앱, 자동화, bundle 전체가 같은 source와 계약을 유지하는지 증명한다.
whenToUse: app runtime, publication, embed, Task, 배포, landing 제품 문구 또는 performance와 security budget을 변경할 때.
---

# Reference product 계약

`examples/apps/referenceProducts.json`이 제품 집합과 claim 경계의 SSOT다. 정확히 다섯 제품을 유지하며 각 제품은 별도 예외 허용 목록이 아니라 production contract의 실제 소비자다.

각 제품의 `journey`는 `plainPython`, `publicSdkImports`, `appProjection`, `embedModes`, `publicationSteps`, `proofKinds`, `claimBoundary`를 가진 닫힌 객체다. machine verifier는 source AST의 root SDK import, plain Python 실행과 app entry projection을 확인하고, browser verifier는 같은 행의 target publication 단계, proof와 embed mode를 이어서 확인한다. 계산기만 output, interactive, editable embed를 선언하며 세 모드를 실제 Chromium에서 모두 소비한다.

| 제품 | target | 전체 journey |
| --- | --- | --- |
| 반응형 견적 계산기 | browser | plain Python, app projection, static build, serve, output·interactive·editable embed, deploy |
| CSV 지역 매출 대시보드 | browser | asset snapshot build, serve, deploy |
| 운영 상태 snapshot 보고서 | browser | 외부 요청 없는 build, serve, deploy |
| Secret 참조 서버 상태 앱 | server | server build, session serve, secret redaction, deploy |
| 재고 파일 자동화 대시보드 | local | local build, 권한 승인 serve, 이전 build rollback |

## 불변 조건

- source는 `# /// codaro-app` metadata가 있는 평범한 Percent Python 파일이며 `python app.py`로 실행된다.
- compiler target은 manifest 선언과 정확히 같고 blocked 기능을 약한 browser fallback으로 바꾸지 않는다.
- static bundle은 localhost Chromium에서 외부 network 요청 0건, console과 page 오류 0건이어야 한다.
- server bundle은 secret reference 이름만 보존하고 실제 값은 bundle, log, client text에 노출하지 않는다.
- Local publication은 manifest의 exact policy hash를 승인한 뒤에만 열리며 실제 child process와 JSON artifact를 만든다.
- desktop과 390px mobile에서 앱 projection, heading, entry, overflow를 실제 Chromium으로 확인한다.
- 실패한 reactive output은 stale로 표시하고 수정 뒤 같은 session에서 회복해야 한다.
- reference source는 build, serve, plain Python 실행으로 수정되지 않는다.
- IDE, 앱, embed와 publication은 reference source를 복사하거나 전용 문법으로 변환하지 않는다.

## 성능 예산

- app ready: 180초 이하
- browser와 embed widget interaction: 8초 이하
- server worker widget interaction: 15초 이하
- static bundle: 제품당 300 MiB 이하
- static 외부 request: 0건
- mobile horizontal overflow: 1px 이하

예산은 느린 clean runtime 초기화까지 포함하는 상한이다. 측정값은 `output/test-runner/reference-products/reference-products-report.json`에 저장한다.

## 정직한 claim 경계

기계 검증은 reference source의 plain Python 실행, public SDK import와 app projection, 해당 target build와 serve, 계산기 output·interactive·editable embed, 로컬 publication, content hash가 연결된 deployment receipt와 rollback, localhost 또는 LAN bundle 검증까지다. 학습 strong evidence에서 Task operational proof로 이어지는 same-source 계약은 [[learning-product-bridge]]의 Day30 golden이 증명하고 `python-product`가 같은 current commit에 결속한다.

빈 환경 built wheel의 public Python SDK와 CLI는 `python-sdk` gate가 direct wheel, `uv add --find-links`, exact wheel `uvx`, root import, server mount, CLI와 package data를 통과할 때만 machine-verified 범위에 들어간다. 공용 인터넷 URL의 DNS, TLS, uptime, provider 지속성, 인간 학습 효과, `shared` app state, 범용 IDE 전체와 browser bundle source 비공개성은 증명하지 않는다.

README와 landing은 manifest의 `machineVerified` 범위보다 넓은 효과나 가용성을 약속할 수 없다. `verifyReferenceProducts.py`가 source 보존, plain Python 실행, compiler target과 공개 문구를 먼저 검사하고, Playwright 검증은 그 machine report가 통과한 경우에만 시작한다.

## 검증

```powershell
uv run python -X utf8 tests/run.py gate reference-products
```

전용 gate는 pytest contract, machine verifier, editor와 landing production build, 다섯 제품의 실제 Chromium journey를 순서대로 실행한다. 제품 하나가 실패하면 공개 claim과 해당 노출을 내리고 core contract를 우회하지 않는다.
