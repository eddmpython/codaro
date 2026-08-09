---
id: deployment-adapters
title: 배포 adapter 계약
description: 검증된 immutable publication을 folder, zip, self-host, provider로 전달하고 probe한 뒤 pointer와 proof를 확정하는 계약이다.
category: architecture
section: reference
order: 218
purpose: hosting 사업자와 core compiler를 분리하면서 byte 무결성, rollback, credential 비노출을 보장한다.
whenToUse: codaro deploy, 배포 adapter, ZIP export, provider upload, deployment receipt, rollback을 변경할 때.
---

# 배포 adapter 계약

`src/codaro/publication/adapters/`가 배포 adapter의 단일 경계다. adapter는 source 문서나 build bundle을 수정하지 않으며 `verifyPublication`, `verifyServerPublication`, `verifyBlockEmbed` 중 하나를 통과한 active publication만 입력으로 받는다.

## 명령

```powershell
codaro deploy ./app-site --target folder --output ./public
codaro deploy ./app-site --target zip --output ./app-site.zip
codaro deploy ./app-server --target self-host --output ./self-host
codaro serve ./self-host
```

`folder`, `zip`, `self-host`에는 credential이 필요 없다. `provider`는 `DeploymentAdapter` protocol을 구현한 외부 adapter가 맡는다. core compiler와 proof domain은 GitHub, Cloudflare 같은 provider SDK를 import하지 않는다. 내장 `ProviderFilesystemAdapter`는 같은 계약의 conformance test와 로컬 integration에만 사용한다.

## 순서

```text
prepare
  -> source publication 전체 hash 재검증
upload
  -> immutable version만 전송, active pointer 유지
probe
  -> file bytes, artifact hash, manifest hash 재검증
activate
  -> 검증 성공 뒤 pointer 원자 교체
receipt
  -> SourceRevision, BuildArtifact, DeploymentReceipt를 한 archive transaction으로 기록
```

probe가 실패하면 active pointer와 proof archive는 바뀌지 않는다. activate 도중 검증이나 state 기록이 실패하면 이전 pointer와 state를 복원한다. rollback은 보존된 immutable version의 pointer만 다시 활성화하고 source와 bundle bytes를 덮어쓰지 않는다.

## core target

- `folder`: content-addressed bundle을 복사하고 검증된 active pointer를 마지막에 쓴다.
- `zip`: 경로 순서, timestamp, permission, 압축 설정을 고정한 byte-reproducible ZIP을 만든다.
- `self-host`: folder와 같은 무결성 계약을 사용하며 `codaro serve`로 Local 또는 LAN에서 실행한다. 공용 인터넷 가용성을 주장하지 않는다.
- `provider`: credential reference 이름만 durable contract에 두고 값은 adapter 경계에서 환경 변수로 읽는다. diagnostic에는 credential 값을 남기지 않는다.

## proof와 가용성 경계

`DeploymentReceipt`는 검증된 배포 artifact가 어느 source와 build에서 왔는지 증명한다. URL의 uptime, DNS, TLS, 실제 사용자 도달 여부는 증명하지 않는다. provider upload 오류는 기존 build receipt, learning evidence, 이전 deployment pointer를 수정하지 않는다.

## 앱 표면

저장된 Local 문서의 앱 미리보기에는 compiler가 판정한 browser 또는 server target에 맞는 build, ZIP, self-host 명령을 표시한다. local 또는 blocked 기능은 웹 bundle을 만들 수 있다고 안내하지 않는다. 이 표면은 provider credential을 받거나 저장하지 않는다.

## 검증

```powershell
uv run python -X utf8 tests/run.py gate deployment-adapters
```

전용 gate는 folder와 self-host의 실제 verifier 통과, deterministic ZIP, provider credential 부정 경로, 손상 upload의 pointer 보존, proof chain, rollback, CLI 계약을 확인한다.
