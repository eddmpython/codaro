# 기능 블록 compiler

상태: 대기

## 목표

entry block의 AST dependency closure, package, asset, effect, state를 분석해 browser, server, local, blocked target과 정확한 이유를 산출한다.

## 영향 파일

- `src/codaro/document/analysis.py`
- `src/codaro/kernel/reactivePlan.py`
- 새 `src/codaro/publication/compiler.py`
- `editor/src/lib/reactiveDiagnostics.ts`
- `tests/publication/`, `tests/document/`

## 영향 함수·심볼

- 새 `compileExecutableUnit`, `SourceRevision`, `TargetDecision`
- 기존 cell binding과 dependency graph adapter
- package wheel compatibility, effect detector, asset collector
- deterministic manifest hash

## 테스트

- browser, server, local, blocked fixture가 source span과 reason code를 가진다.
- eval, dynamic import, native wheel, secret, OS call을 silent pass하지 않는다.
- 같은 source와 lock은 같은 closure와 manifest hash를 만든다.
- cycle과 multiple definition은 build를 차단하고 editor 진단과 같은 owner를 사용한다.

## 롤백

compiler는 source를 변경하지 않는 read-only domain으로 도입한다. 이전 manual target 선택은 proof를 만들지 않는 legacy preview로만 남겼다가 compiler coverage 뒤 제거한다.

## 평가

개발자 관점에서는 Web/Local별 규칙 복사가 없어야 한다. PM 관점에서는 사용자가 배포 방식을 추측하지 않고 어떤 셀 때문에 target이 바뀌는지 바로 알아야 한다.
