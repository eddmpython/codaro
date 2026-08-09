# 서버 publication

상태: 대기

## 목표

native package, secret reference, 제한 filesystem이 필요한 앱을 provider-neutral server bundle로 만들고 self-host 실행과 rollback을 제공한다.

## 영향 파일

- 새 `src/codaro/publication/serverBuilder.py`
- `src/codaro/server.py`
- `src/codaro/runtime/`
- `src/codaro/system/processSupervisor.py`
- `src/codaro/cli.py`
- `tests/publication/`, `tests/runtime/`

## 영향 함수·심볼

- 새 server bundle manifest와 launcher
- session runtime factory와 quota policy
- health, interrupt, shutdown, secret reference resolver
- immutable version pointer와 rollback

## 테스트

- 동시 browser session state 누출 0건이다.
- secret value가 client payload, source bundle, log에 나오지 않는다.
- worker crash가 다른 session과 supervisor를 죽이지 않는다.
- source 변경은 build와 safety receipt를 무효화하고 이전 hash rollback은 동작한다.

## 롤백

bundle별 isolated environment와 immutable directory를 유지한다. active pointer 전환 실패 시 이전 health-checked hash로 즉시 복원한다.

## 평가

개발자 관점에서는 `createServerApp` 마운팅과 existing process supervision을 재사용한다. PM 관점에서는 특정 cloud를 선택하기 전에 완전한 self-host 앱을 가져야 한다.
