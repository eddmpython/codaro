---
id: learning-product-bridge
title: 학습 결과 제품 승격 계약
description: strong application evidence를 동일 소스 기능 블록, Task, operational proof로 연결하는 계약이다.
category: architecture
section: reference
order: 218
purpose: 학습 코드를 복사하거나 일반 Task 성공을 성취로 오해하지 않고 검증된 결과물을 실제 기능으로 이어 간다.
whenToUse: learning archive 승격, 기능 블록 계보, Task provenance, application rerun 표시를 변경할 때.
---

# 학습 결과 제품 승격 계약

`promoteLearningArtifactToExecutableUnit()`가 학습 결과를 제품 기능으로 바꾸는 유일한 writer다. 현재 claim version의 `application` 역할, Local strong check, artifact contract, 보존된 artifact bytes, source block hash가 모두 맞아야 승격한다. weak, noError, self-rating, 일반 Task 입력, automation recipe blob은 이 권한을 대신하지 못한다.

승격은 learner draft의 코드를 다시 생성하지 않는다. 같은 block content를 Percent 문서의 단일 기능 블록으로 materialize하고 `compileExecutableUnit()`의 입력, 출력, effect, runtime 계약을 붙인다. 저장 후 block hash를 다시 읽어 evidence source hash와 비교한다. 다르면 SourceRevision과 Task를 만들지 않는다.

Local 학습 화면은 strong application transaction 저장 직후 current learning archive를 `sync`한다. 사용자는 archive 파일을 내보내거나 다시 가져오지 않는다. 현재 실행 source와 편집 중 draft가 같고, created artifact와 application credit이 같은 transaction에 있을 때 결과 카드에 `기능으로 만들기`를 표시한다. 실행 뒤 코드를 바꿨거나 weak, 저장 실패, artifact 없음 상태라면 승격 버튼 대신 다시 실행하거나 결과물을 만들라는 정확한 다음 행동을 표시한다.

승격 가능한 application 소스는 강검증 함수와 운영 실행 진입점을 함께 가진다. 강검증 fixture는 입력 없이 함수를 호출하고, TaskRunner는 `ExecutableUnitSpec.inputSchema`의 사용자 입력을 같은 소스에 주입해 결과물을 다시 만든다. Python builtin은 외부 입력 계약에서 제외한다.

일반 Task의 `inputs`와 학습 계보는 분리한다. 학습 계보는 public Task API가 쓸 수 없는 `TaskDefinition.provenance`와 promoted Percent block의 versioned payload에 저장된다. payload는 SourceRevision receipt ID, source block hash, dependency hash, application credit ID, check ID와 이들의 lineage hash를 고정한다. 저장된 전체 Percent bytes는 별도 local BuildArtifact hash로 고정한다. 코드나 입력, 출력 계약, 권한이 바뀌면 Task safety confirmation도 다시 필요하다.

application의 `자동화로 다시 실행됨`은 예외 없이 끝난 Task 실행이 아니다. 다음 조건을 모두 충족한 `OperationalRunReceipt`만 capability projection에 들어간다.

- 컴파일된 required input 전부를 사용자가 선택했다.
- source block hash가 학습 evidence 및 SourceRevision과 같다.
- 현재 safety permission receipt가 있다.
- JSON artifact contract 같은 의미 검사가 통과했다.
- input, check, output artifact hash가 같은 proof chain에 묶였다.

배포와 URL은 distribution 증거이며 학습 assurance 또는 application credit을 만들지 않는다.

publication은 이 payload를 시작점으로 기존 ProofArchive DAG를 확장한다. static, server, embed build가 source root에 BuildArtifact를 추가하고 deployment가 그 publication build에 DeploymentReceipt를 추가한다. `ProofArchive.resolveLineage()`는 어느 receipt에서도 같은 source root의 연결을 다시 검증한다.

## 검증

```powershell
uv run python -X utf8 tests/run.py gate learning-product-bridge
```

gate는 약한 증거, provenance spoof, stale source, JSON 의미 오류를 거부한다. 실제 production editor Chromium에서 초보자 기본 경로와 entry fast-track 경로가 레슨 실행, 강검증, 결과 카드 승격, safety 확인, Task 실행, capability 표시를 거쳐 같은 source block, ExecutableUnit, 최종 artifact에 도달하는지도 확인한다. 합성 HTML과 사용자 archive export/import는 이 경로에 허용하지 않는다.

이 gate의 same-source 기능 및 자동화 증거는 `python-product`에서 SDK, 앱 projection, publication, embed, deployment와 같은 current commit에 결속된다. 학습 단독 report나 일반 Task 성공만으로 전체 Python 제품 여정을 통과한 것으로 보지 않는다.
