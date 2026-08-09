---
id: block-embedding
title: 기능 블록 임베딩 계약
description: 하나의 entry와 dependency closure를 Web Component로 다른 페이지에 넣는 immutable embed 계약이다.
category: architecture
section: reference
order: 217
purpose: 전체 편집기를 복제하지 않고 검증된 Python 기능 블록을 output, interactive, editable 표면으로 재사용한다.
whenToUse: codaro-block, embed message, iframe sandbox, embed bundle과 publication 연결을 변경할 때.
---

# 기능 블록 임베딩 계약

`src/codaro/publication/embedBuilder.py`가 immutable embed bundle과 검증 서버를 소유한다. 실제 Python 실행은 별도 runtime을 만들지 않고 `buildStaticPublication()`이 만든 browser publication을 사용한다. publication 문서에는 선택한 entry와 그 dependency closure만 들어간다.

## 명령과 사용

```powershell
codaro build app.py --target embed --entry result-block --mode interactive --output result-embed
codaro serve result-embed
```

생성된 host 예시는 아래 공개 계약을 사용한다.

```html
<script type="module" src="./codaro-block.js"></script>
<codaro-block src="./embed.json" mode="interactive"></codaro-block>
```

`output`은 위젯 조작을 막은 읽기 전용 결과다. `interactive`는 위젯과 reactive downstream을 실행한다. `editable`은 browser bundle에서만 코드 편집과 같은 runtime 재실행을 허용한다. server 또는 local 기능을 browser embed로 낮추지 않는다.

## bundle과 identity

```text
result-embed/
├── active.json
├── embeds/<embed hash>/
│   ├── codaro-block.js
│   ├── embed.json
│   └── index.html
└── publication/
    ├── active.json
    └── bundles/<publication hash>/...
```

`embed.json`은 entry block, dependency block, 허용 mode, iframe sandbox, loader hash, publication bundle과 manifest hash를 고정한다. embed는 publication runtime을 복사하지 않고 같은 immutable bundle을 참조한다. source, dependency, package, asset 또는 loader가 바뀌면 hash가 달라진다.

## Web Component와 메시지

`editor/src/embed/codaroBlock.js`는 open Shadow DOM 안에 iframe 하나를 만들고 같은 manifest URL의 fetch promise를 페이지 전체에서 공유한다. 각 iframe은 별도 browser runtime과 widget state를 가진다. host CSS는 Shadow DOM과 iframe 내부에 들어가지 않는다.

`contracts/embedMessage.schema.json`이 `codaro.embed` protocol version 1의 init, ready, resize, error 메시지를 닫힌 object로 정의한다. host와 frame은 `event.source`, exact origin, protocol version, embed ID, frame ID, exact payload field를 모두 확인한다. 버전이나 payload가 다르면 호환 fallback 없이 무시한다.

## 보안 경계

iframe sandbox는 `allow-scripts allow-same-origin` 두 권한만 사용한다. 이 조합은 임의의 제3자 코드를 격리하는 보안 sandbox가 아니다. embed bundle은 publication 작성자가 소유한 검증된 코드만 실행하며 public arbitrary code upload를 받지 않는다. 다른 origin의 비신뢰 코드를 같은 sandbox로 열면 안 된다.

loader는 `referrerPolicy=no-referrer`, exact frame origin, content hash manifest를 사용한다. embed localhost server는 output root와 검증된 publication bundle 밖의 경로를 제공하지 않으며 외부 CDN 요청을 허용하지 않는다.

## 검증

```powershell
uv run python -X utf8 tests/run.py gate block-embedding
```

gate는 closure-only 문서, immutable build 재사용, 손상 거부, non-browser 차단, 생성 계약과 editor build를 확인한다. 실제 Chromium에서는 한 host의 두 interactive embed가 state와 CSS를 공유하지 않는지, manifest가 한 번만 fetch되는지, invalid origin과 protocol 메시지가 거부되는지, editable 코드가 다시 실행되는지 검사한다.
