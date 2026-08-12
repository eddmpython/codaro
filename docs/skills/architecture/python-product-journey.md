---
id: python-product-journey
title: Python IDE에서 제품까지의 여정
description: 하나의 Percent Python source가 IDE, 앱, 부분 임베딩, publication, 자동화와 Python SDK로 이어지는 제품 계약.
category: architecture
section: reference
order: 220
purpose: Codaro의 북극성과 공개 claim을 실제 owner 및 gate에 연결한다.
whenToUse: 공개 Python API, 앱 projection, block embed, publication target, 자동화 승격 또는 제품 소개를 변경할 때.
---

# Python IDE에서 제품까지의 여정

## 북극성

Codaro는 평범한 Percent Python 파일을 학습하고 개발하는 **Codaro형 local-first Python IDE**다. 같은 소스를 다시 작성하지 않고 전체 앱, 선택한 기능 블록, 자동화 태스크와 재사용 가능한 Python API로 승격하고 browser, server, local에 검증된 산출물로 publication한다.

Codaro형 IDE는 범용 편집기 복제품을 뜻하지 않는다. 필수 범위는 Percent Python 편집과 저장, reactive 실행, 변수와 출력 확인, 앱 preview, publication 작업면, 자동화 승격이다. source control UI, 범용 debugger, extension marketplace와 실시간 공동 편집은 제품 claim이 아니다.

## 하나의 source가 이동하는 단계

| 단계 | 단일 owner | 증거 |
| --- | --- | --- |
| plain Python과 Percent 문서 | `src/codaro/document.py`, `src/codaro/percentFormat.py` | `backend`, `reference-products` |
| IDE 편집, 저장, reactive 실행, 출력, Markdown 다이어그램과 앱 preview | `editor/`, `src/codaro/appRuntime.py` | `app-runtime`, `markdown-diagram`, `editor-build` |
| browser, server, local target 판정 | `src/codaro/publication/compiler.py` | `publication-compiler` |
| 전체 앱 publication | static, server, local builder와 verifier | `static-publication`, `server-publication`, `local-publication` |
| 선택 기능 블록의 부분 임베딩 | `src/codaro/publication/embed.py` | `block-embedding` |
| verify, serve, deploy, rollback | `src/codaro/publication/workbench.py`, deployment adapter | `deployment-adapters`, `reference-products` |
| 학습 결과의 기능과 자동화 승격 | learning evidence와 automation proof owner | `learning-product-bridge`, `automation-ide-audit` |
| 재사용 가능한 Python API와 CLI | `src/codaro/__init__.py`, distribution builder | `python-sdk` |

각 단계는 앞 단계를 복사하지 않는다. compiler target 규칙은 [publication compiler](publication-compiler.md), target별 bundle 규칙은 [static publication](static-publication.md), [server publication](server-publication.md), [block embedding](block-embedding.md), 실제 다섯 제품은 [reference products](reference-products.md)가 소유한다.

## 공개 claim matrix

| claim | 공개 가능한 범위 | 비검증 경계 |
| --- | --- | --- |
| Python IDE | 평범한 `.py` 편집과 저장, reactive 실행, 변수와 출력, 앱 preview와 publication 작업면 | VS Code급 범용 IDE 기능 전체 |
| 전체 앱 | 같은 문서의 AppSpec과 reactive graph를 사용하는 browser, server, local projection | `shared` state의 동시 사용자 일관성 |
| 부분 임베딩 | 선택 entry의 dependency closure를 output, interactive, editable Web Component로 생성하고 origin과 protocol을 검증 | host page 바깥의 신뢰 경계 우회 |
| publication | immutable build를 verify한 뒤 folder, ZIP, self-host 또는 provider adapter로 전달하고 receipt와 rollback을 남김 | 공용 DNS, TLS, uptime, provider 지속성 |
| Python SDK | built wheel에서 공개 root import, advanced `codaro.publication` namespace와 CLI를 같은 버전으로 사용 | 저장소 checkout에만 존재하는 내부 module을 공개 API로 간주하지 않음 |
| source 보호 | server secret 값은 client bundle에서 제외 | browser bundle의 Python source 비공개성, `hideCode`를 보안 경계로 사용 |

공개 문구의 machine-verified 및 not-verified 목록은 `examples/apps/referenceProducts.json`의 `claimBoundary`가 소유한다. README와 landing은 이 범위를 넘을 수 없다.

## 설치와 배포 채널

- PyPI wheel은 개발자의 Python SDK와 CLI 채널이다. `uv add codaro`는 library 사용, `uvx codaro`는 일회성 CLI 실행을 맡는다.
- Windows 일반 사용자 설치는 GitHub Release manifest가 고정한 runtime과 exact wheel을 사용한다.
- 버전 변경, tag, GitHub Release와 PyPI publish는 별도 릴리즈 요청과 release gate가 있어야 실행한다.
- publication build와 외부 release는 다르다. local folder, ZIP과 self-host bundle 생성은 제품 기능이지만 외부 package 발행은 운영 변경이다.

## 제품 판정

`python-product` sequence는 `root-clean`, `docs`, `backend`, `architecture-boundary`, `python-sdk`, `app-runtime`, `markdown-diagram`, `publication-compiler`, `static-publication`, `server-publication`, `local-publication`, `block-embedding`, `learning-product-bridge`, `deployment-adapters`, `reference-products`, `automation-ide-audit`를 이 순서로 실행한다. 각 이름은 기존 gate를 그대로 참조하며 구현 명령을 복사하지 않는다.

`output/test-runner/python-product/sequence-summary.json`의 16개 gate가 모두 hard green이고 `gitHead`와 artifact의 `payloadGitHead`가 현재 clean HEAD와 같을 때만 전체 제품 여정이 통과한다. `quality-cycle`은 이 16개 gate를 같은 순서의 ordered subset으로 소유한다. 개별 gate 성공이나 stale summary로 전체 제품 완료를 주장하지 않는다.

## 관련

- [제품 표면 모드](../identity/multi-editor-modes.md)
- [마운팅과 통합](../identity/mounting-and-integration.md)
- [GUI 제어 계약](gui-control-contract.md)
- [학습 결과 제품 승격](learning-product-bridge.md)
- [배포 adapter](deployment-adapters.md)
