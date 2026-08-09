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

일반 Task의 `inputs`와 학습 계보는 분리한다. 학습 계보는 public Task API가 쓸 수 없는 `TaskDefinition.provenance`에 저장되며 SourceRevision, BuildArtifact, application credit, artifact hash를 고정한다. 코드나 입력, 출력 계약, 권한이 바뀌면 Task safety confirmation도 다시 필요하다.

application의 `자동화로 다시 실행됨`은 예외 없이 끝난 Task 실행이 아니다. 다음 조건을 모두 충족한 `OperationalRunReceipt`만 capability projection에 들어간다.

- 컴파일된 required input 전부를 사용자가 선택했다.
- source block hash가 학습 evidence 및 SourceRevision과 같다.
- 현재 safety permission receipt가 있다.
- JSON artifact contract 같은 의미 검사가 통과했다.
- input, check, output artifact hash가 같은 proof chain에 묶였다.

배포와 URL은 distribution 증거이며 학습 assurance 또는 application credit을 만들지 않는다.

## 검증

```powershell
uv run python -X utf8 tests/run.py gate learning-product-bridge
```

gate는 약한 증거, provenance spoof, stale source, JSON 의미 오류를 거부한다. 실제 Chromium에서 초보자 기본 경로와 entry fast-track 경로가 같은 source block, ExecutableUnit, 최종 artifact에 도달하는지도 확인한다.
