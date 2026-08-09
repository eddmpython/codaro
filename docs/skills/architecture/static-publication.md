---
id: static-publication
title: 정적 publication 계약
description: browser 기능 블록을 재현 가능한 self-host bundle로 만드는 build, verify, serve 계약이다.
category: architecture
section: reference
order: 215
purpose: 같은 Python source와 data asset을 외부 CDN 요청 없이 실행되는 immutable app bundle로 승격한다.
whenToUse: codaro build, 정적 app runtime, browser package wheel, publication integrity, local serve를 변경할 때.
---

# 정적 publication 계약

`src/codaro/publication/staticBuilder.py`가 browser publication의 build, verify, active pointer, local serve를 소유한다. 입력 문서는 source 파일이고 출력은 content-addressed immutable bundle이다. build는 source를 수정하지 않는다.

## 명령

```powershell
codaro inspect app.py
codaro build app.py --target browser --output app-site
codaro serve app-site
```

`codaro build`는 compiler target이 `browser`일 때만 진행한다. server 또는 local 기능을 약한 browser fallback으로 바꾸지 않는다. 실패할 때는 첫 blocker code, source path, line, 설명을 출력하고 nonzero로 끝난다.

## 출력 구조

```text
app-site/
├── active.json
└── bundles/
    └── <bundle sha256>/
        ├── index.html
        ├── publication.json
        ├── document.json
        ├── _app/
        ├── data/
        ├── packages/
        └── vendor/
            ├── pyodide/
            └── pyproc/
```

`PublicationManifest@1`은 compiler manifest, source revision, entry block, document, runtime, data, wheel, 전체 file hash를 고정한다. `active.json`은 index와 manifest file hash를 포함하고 현재 immutable bundle만 가리킨다. 같은 입력의 두 build는 같은 hash 디렉터리를 재사용한다.

## runtime과 네트워크

browser Python core와 process runtime 파일은 editor build에 버전 고정 자산으로 포함한다. 정적 index는 모든 app shell URL을 상대 경로로 바꾸고 외부 preconnect를 제거한다. CSP의 `connect-src`는 same-origin만 허용한다. 실제 Chromium gate는 page request, failed request, console error, page error를 모두 관찰해 외부 요청과 조용한 fallback이 0인지 확인한다.

`codaro`, `pyodide`, `js` import는 browser runtime 제공 모듈이므로 package 설치 대상으로 추론하지 않는다. third-party package는 compiler의 browser smoke만으로 충분하지 않다. package lock에 workspace 안의 `wheelPath`와 일치하는 `wheelHash`가 있어야 하며 bundle의 `packages/`로 복사된다. 정적 문서에는 원래 package 이름 대신 그 local wheel URL만 기록한다.

## data snapshot

compiler가 literal relative read로 수집한 파일만 `data/`에 넣는다. compile 직후 원본 hash를 다시 확인해 중간 변경을 stale snapshot으로 거부한다. browser runtime은 app 실행 전에 bundle bytes를 다시 hash 검증하고 `/home/web/codaro`의 같은 상대 경로에 쓴다. 절대 경로, workspace 밖 경로, 동적 경로, 민감 파일은 이 경로로 승격되지 않는다.

## 위젯과 상태

정적 app은 별도 실행 모델을 만들지 않는다. 기존 reactive graph와 App Projection을 사용한다. browser kernel은 Codaro의 output descriptor와 UI value 모듈을 내장하고, 위젯 값을 바꾸면 정의 셀을 다시 만들지 않은 채 dependent closure만 실행한다. `perSession` 상태는 브라우저 runtime 인스턴스에 머문다. shared state는 compiler에서 server target으로 승급한다.

## 롤백과 손상

build는 output 아래 임시 디렉터리를 완성한 뒤 동일 파일 hash를 확인하고 최종 hash 디렉터리로 rename한다. 같은 hash의 기존 bundle이 하나라도 다르면 손상으로 거부하며 덮어쓰지 않는다. 새 bundle을 검증한 뒤 `active.json`만 원자 교체한다. 이전 hash 디렉터리는 남아 있으므로 pointer를 되돌릴 수 있다.

`servePublication`은 시작할 때 manifest, 실제 파일 집합, byte size, file hash, index hash, pointer hash를 전부 검증한다. 손상이나 path traversal이 있으면 HTTP server를 열지 않는다.

## 검증

```powershell
uv run python -X utf8 tests/run.py gate static-publication
```

집중 gate는 두 clean build의 byte identity, stale data, corrupt file, path traversal, unsupported target, package wheel 경계를 검사한다. 이어 실제 Chromium에서 data file을 읽고 number widget을 바꿔 downstream 결과가 다시 계산되는지 확인한다.
