---
id: publication-compiler
title: 기능 블록 compiler 계약
description: 같은 Python source를 browser, server, local publication 대상으로 판정하는 단일 계약이다.
category: architecture
section: reference
order: 214
purpose: 기능 블록을 앱, 임베드, 자동화, 배포로 승격하기 전에 실행 경계와 재현 가능한 content identity를 확정한다.
whenToUse: publication target, ExecutableUnit, package lock, asset 수집, editor 배포 진단을 변경할 때.
---

# 기능 블록 compiler 계약

`src/codaro/publication/compiler.py`가 기능 블록 판정의 owner다. CLI, HTTP API, 편집기는 이 결과를 소비하며 target 규칙을 각 표면에 다시 구현하지 않는다.

## 입력과 출력

입력은 `CodaroDocument`, entry block id, source text, workspace root, 선택적인 package compatibility lock이다. compiler는 기존 reactive graph에서 entry가 필요로 하는 provider closure를 역으로 추적한다.

출력은 다음 값을 포함한다.

- `ExecutableUnitSpec@1`: entry, dependency closure, input/output schema, effect, state, target, source span, content hash, 진단
- `SourceRevision@1`: source, block, package lock의 결정적인 hash 묶음
- `TargetDecision`: browser, server, local 후보별 가능 여부와 reason code
- `manifestHash`: source, closure, package lock, asset, target 결정을 모두 포함한 content identity

같은 source와 같은 lock은 같은 closure와 manifest hash를 만든다. compiler는 source나 workspace 파일을 변경하지 않는다.

## target 정책

| target | 허용 경계 | 대표 승급 또는 차단 사유 |
| --- | --- | --- |
| browser | 순수 Python, browser smoke를 통과한 고정 wheel, workspace 안의 고정 read asset | secret, network, 동적 파일, 쓰기, native wheel이 있으면 상위 target으로 이동 |
| server | secret reference, 제한된 network, 동적 read, 파일 쓰기, shared state | process, GUI, 운영체제 전용 API, 절대 경로가 있으면 local로 이동 |
| local | 사용자가 소유한 장치에서 실행해야 하는 process, GUI, native wheel, workspace 밖 경로 | 분석 불가능하거나 재현 불가능한 기능은 허용하지 않음 |
| blocked | 어떤 target에서도 정직한 build를 만들 수 없음 | 문법 오류, 동적 코드 실행, reactive cycle, multiple definition, 잘못된 package lock, 누락 또는 민감 자산 |

불확실한 기능은 browser 가능으로 추정하지 않는다. 판정 이유는 `CapabilityDiagnostic.blockId`와 한 줄 이상인 `sourceSpan`에 결속한다.

## package compatibility lock

lock은 정규화된 package 이름을 key로 쓰는 JSON object다. 각 값은 아래 필드를 가진다.

```json
{
  "sample-package": {
    "wheelHash": "sha256-<64 lowercase hex>",
    "tags": ["py3-none-any"],
    "browserSmoke": true,
    "serverSmoke": false
  }
}
```

브라우저 판정은 `py3-none-any` 또는 `emscripten` 및 `wasm32` wheel tag, 고정 hash, 실제 browser smoke 통과가 모두 있어야 한다. 선언됐지만 lock이 없거나 import가 선언되지 않았으면 server보다 낮게 판정하지 않는다. 그 밖의 native wheel은 local smoke가 완성되기 전까지 local로 판정한다.

## 자산과 보안

literal relative read는 workspace 안에서 resolve하고 bytes hash를 `assetHashes`에 넣는다. 동적 경로는 server, 절대 경로와 workspace 밖 경로는 local이다. 누락 파일, 50 MiB 초과 파일, `.env`, private key와 credential 파일은 build를 차단한다. compiler 결과에는 secret 값이나 자산 bytes를 넣지 않는다.

## 표면 연결

- `codaro inspect <file>`은 target, manifest, entry, source span 진단을 출력하고 blocked이면 nonzero로 끝난다.
- `/api/publication/inspect`는 workspace 밖 path를 거부하고 저장 전 draft를 같은 compiler로 판정한다.
- 편집기는 API 결과만 받아 문서 target banner와 셀 진단 chip으로 투영한다.

다음 publication 단계는 이 manifest를 입력으로 사용해야 한다. source, dependency, package lock, asset, effect 중 하나가 바뀌면 기존 build, permission, deployment receipt를 그대로 재사용하지 않는다.
