# 정적 publication

상태: 대기

## 목표

browser-compatible 기능 블록을 외부 CDN 없이 동작하는 relative asset bundle로 만들고 `codaro build --target browser`, `codaro serve`와 실제 browser verifier를 제공한다.

## 영향 파일

- 새 `src/codaro/publication/staticBuilder.py`
- `src/codaro/cli.py`
- `editor/vite.config.ts`
- `editor/src/lib/browserPythonRuntime.ts`
- `src/codaro/webBuild/`
- `tests/publication/verifyStaticPublicationPlaywright.py`

## 영향 함수·심볼

- 새 `buildStaticPublication`, `servePublication`
- asset integrity와 package lock collector
- atomic output publisher와 content-addressed bundle root
- CLI build, inspect, serve command

## 테스트

- 두 clean build의 manifest와 file hash가 같다.
- localhost Chromium에서 외부 network request 0, console error 0, widget interaction을 검증한다.
- unsupported cell은 exact blocker와 nonzero exit를 낸다.
- 손상 asset, path traversal, stale snapshot을 거부한다.

## 롤백

temp directory에서 완성하고 hash 검증 뒤 immutable directory로 rename한다. source와 이전 bundle은 수정하지 않고 active pointer만 전환한다.

## 평가

개발자 관점에서는 기존 pyproc과 editor asset pipeline을 재사용해야 한다. PM 관점에서는 cloud 계정 없이 폴더 하나와 로컬 URL로 완성된 앱을 확인할 수 있어야 한다.
