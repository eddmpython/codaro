# 블록 임베딩

상태: 대기

## 목표

전체 IDE iframe이 아니라 entry block과 dependency closure를 output 또는 interactive component로 다른 페이지에 삽입한다. editable은 trusted local 또는 browser tier에서만 허용한다.

## 영향 파일

- 새 `editor/src/embed/`
- 새 `src/codaro/publication/embedBuilder.py`
- `editor/src/components/widgets/widgetHost.tsx`
- `src/codaro/server.py`
- `contracts/embedMessage.schema.json`
- `tests/publication/verifyBlockEmbedPlaywright.py`

## 영향 함수·심볼

- `<codaro-block>` Web Component
- Shadow DOM renderer와 shared runtime loader
- versioned postMessage validator
- output, interactive, editable mode policy

## 테스트

- 한 host page의 두 embed가 state와 CSS를 공유하지 않는다.
- 공용 runtime asset을 중복 load하지 않는다.
- invalid origin, protocol version, event payload를 거부한다.
- 최소 iframe sandbox와 offline localhost serve를 검증한다.

## 롤백

embed bundle은 full app bundle과 별도 entry를 가지되 같은 manifest와 runtime assets를 참조한다. protocol version mismatch는 동작을 축소하지 않고 명시적으로 실패한다.

## 평가

개발자 관점에서는 notebook 전체 DOM을 떼어오지 않고 stable public component contract를 가져야 한다. PM 관점에서는 사용자가 만든 계산기, 표, 차트를 문서와 블로그에 독립적으로 넣을 수 있어야 한다.
