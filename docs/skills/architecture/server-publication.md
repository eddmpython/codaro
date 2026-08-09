---
id: server-publication
title: 서버 publication 계약
description: native package, secret reference와 제한된 filesystem이 필요한 앱의 immutable self-host bundle 계약이다.
category: architecture
section: reference
order: 216
purpose: 같은 Python source를 특정 cloud 없이 검증 가능한 server app으로 build, serve, rollback한다.
whenToUse: codaro build server, published session runtime, secret, wheel, permission, rollback을 변경할 때.
---

# 서버 publication 계약

`src/codaro/publication/serverBuilder.py`가 build, verify, package environment, active pointer와 rollback을 소유한다. `src/codaro/publication/serverRuntime.py`는 검증된 bundle만 실행하는 published API와 session worker를 소유한다. 일반 editor server는 이 API 경계에 포함되지 않는다.

## 명령

```powershell
codaro inspect app.py
codaro build app.py --target server --output app-server
codaro serve app-server --host 127.0.0.1 --port 8766
codaro rollback app-server sha256-<bundle hash>
```

`codaro serve`는 `active.json`의 target을 읽어 browser와 server runtime을 구분한다. 특정 hosting provider는 build 의미를 바꾸지 않는다. 완성된 디렉터리를 VM, container 또는 사용자가 선택한 host로 옮기는 일은 별도 adapter 책임이다.

## immutable bundle

```text
app-server/
├── active.json
├── bundles/
│   └── <bundle sha256>/
│       ├── publication.json
│       ├── requirements.lock
│       ├── shell/
│       ├── workspace-template/
│       └── wheelhouse/
└── runtime/
    ├── environments/<bundle sha256>/
    └── sessions/<bundle sha256>/
```

`PublicationManifest@1`은 compiler manifest, source revision, app shell, source, data, wheel, permission scope, secret 이름, network origin, quota와 모든 file hash를 고정한다. build는 임시 디렉터리에서 끝까지 만든 뒤 content hash 디렉터리로 원자 승격하고 source를 수정하지 않는다.

package는 workspace 안의 exact wheel, wheel hash와 `serverSmoke: true` lock이 모두 있어야 한다. 설치는 network를 끈 상태에서 bundle wheel만 사용한다. 설치 environment도 전체 file hash receipt를 가지며 한 파일이라도 바뀌면 폐기하고 다시 만든다.

## 실행과 격리

`perSession` 앱은 browser session마다 별도 worker와 workspace copy를 만든다. Python 변수, widget state, 임시 파일과 사용자 파일은 다른 session에 보이지 않는다. worker crash는 해당 session worker만 교체하며 다른 session과 server health는 유지한다. session 삭제과 server shutdown은 worker를 먼저 종료한 뒤 workspace를 지운다.

`shared` state는 compiler가 server 필요 조건으로 판정하지만 동시성 계약은 아직 제품 표면에서 준비 중이다. server build는 이를 조용히 `perSession`으로 낮추지 않고 명시적으로 거부한다.

published API는 document load, exact source execution, reactive execution, widget event, variable 조회, interrupt, reset, package 조회와 health만 제공한다. document save, terminal, AI, automation, 임의 filesystem과 package mutation API는 404로 닫는다. 실행 요청의 block id와 code가 bundle source에서 달라지면 409로 거부한다.

## secret, filesystem, network

manifest에는 secret 이름만 들어간다. 시작할 때 필요한 이름의 값이 하나라도 없으면 server를 열지 않는다. worker 환경은 먼저 비운 뒤 선언된 secret과 session temp 경로만 넣는다. stdout, stderr, display, variable payload의 exact secret 값은 client에 보내기 전에 `[redacted]`로 바꾼다.

filesystem read와 write는 session workspace 안에서 선언된 scope가 있을 때만 허용한다. network는 compiler가 고정한 origin과 `network` scope가 함께 있어야 한다. process 실행과 child process는 published server에서 허용하지 않는다.

`hideCode`는 화면 표시 옵션이며 source 보안 경계가 아니다. 현재 app bootstrap은 reactive graph를 만들기 위해 source를 client document payload로 전달한다. secret 값은 전달하지 않지만 Python 지식재산 은닉이 필요한 앱은 source-free protocol이 별도로 구현되기 전에는 공개하면 안 된다.

## rollback

이전 bundle 디렉터리는 지우지 않는다. `codaro rollback`은 대상 bundle의 manifest, 실제 file set, byte size와 hash를 다시 검증한 뒤 `active.json`만 원자 교체한다. source, permission, effect, quota가 달라지면 policy hash와 bundle hash가 달라져 이전 실행 영수증을 재사용할 수 없다.

## 검증

```powershell
uv run python -X utf8 tests/run.py gate server-publication
```

unit gate는 재현 가능한 build, 손상과 path traversal 거부, offline wheel environment 자기검증, secret 환경 격리, session filesystem 격리, worker crash 복구와 rollback을 검사한다. 실제 Chromium gate는 desktop과 mobile의 두 독립 browser context를 열어 widget 상태가 섞이지 않는지, secret 비노출, app chrome 제거, 외부 request 0, console error 0을 확인한다.
