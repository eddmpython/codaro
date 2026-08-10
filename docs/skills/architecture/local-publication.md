---
id: local-publication
title: 로컬 publication 계약
description: 파일, process, GUI 권한이 필요한 Python app을 immutable bundle로 만들고 사용자 승인 뒤 localhost에서 실행한다.
category: architecture
section: reference
order: 216
purpose: 전체 IDE 권한을 공개 앱에 넘기지 않고 local 기능 블록의 build, 실행, 검증, rollback 경계를 고정한다.
whenToUse: local target builder, permission scope, published runtime, workbench 또는 CLI를 변경할 때.
---

# 로컬 publication 계약

`src/codaro/publication/localBuilder.py`가 immutable local bundle의 owner다. source, execution projection, 고정 asset, package wheel, effect, permission scope, 실행 제한과 Python version을 content-addressed bundle에 봉인한다. build는 원본 workspace를 수정하지 않는다.

`src/codaro/publication/localRuntime.py`는 검증된 active bundle만 연다. 실행할 때 사용자가 화면이나 CLI에서 확인한 exact `policyHash`가 필요하다. hash가 다르거나 누락되면 실행하지 않는다. 각 browser session은 복사된 workspace template과 별도 worker를 사용하며, IDE의 저장, terminal, AI API는 노출하지 않는다.

## 실행 순서

1. compiler가 실제 전체 실행 projection과 local effect를 판정한다.
2. builder가 source, asset, package, runtime shell과 policy를 immutable bundle로 만든다.
3. verifier가 모든 파일 hash, manifest, proof lineage와 policy hash를 다시 계산한다.
4. 제품 작업면은 permission scope와 policy hash를 사용자에게 보여 준다.
5. 사용자가 `권한 확인 후 열기`를 누른 경우에만 localhost runtime을 시작한다.
6. 이전 verified bundle로 rollback할 때 active pointer만 원자적으로 바꾼다.

## 권한과 실패 경계

- filesystem read와 write는 bundle session workspace 안에서만 집행한다.
- process, network, GUI와 secret은 compiler가 찾은 effect에서 permission scope를 파생한다.
- source, asset, package, effect 또는 policy가 달라지면 기존 승인은 재사용하지 않는다.
- 동적 network 목적지, 동적 secret 이름, workspace 밖 자산과 검증되지 않은 package는 build를 차단한다.
- local build가 실패해도 mutable editor app으로 대신 실행하지 않는다.

## 공개 표면

- CLI: `codaro build --target local`, `codaro verify --target local`, `codaro serve --approve-policy <hash>`, `codaro rollback --target local`
- 제품 작업면: build, verify, permission 확인, serve, stop, 이전 build 복원
- runtime API: app bootstrap, immutable document load, kernel 실행, widget, variable, package 조회만 허용

회귀 테스트는 실제 process를 실행하는 재고 자동화로 semantic JSON artifact를 확인한다. source와 workspace 원본 불변성, document와 policy tamper 거부, A/B rollback, 저장과 terminal API 차단을 함께 검증한다.
