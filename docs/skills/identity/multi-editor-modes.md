---
id: multi-editor-modes
title: 제품 표면 모드
description: Product surface principles for conversation, current learning, notebook, and automation.
category: identity
section: concepts
order: 109
purpose: 대화, 학습, 노트북, 자동화 네 표면을 같은 문서 모델, 같은 엔진, 같은 API 위에 둔다.
whenToUse: 새 모드 추가, 모드 간 전환 UX, 모드별 chrome 설계할 때.
---

# 제품 표면 모드

Codaro의 제품 표면은 `editor/`이고, 사용자에게 보이는 표면은 네 개다. 사이드바 순서는 `학습 → 노트북 → 자동화 → 대화`이며, 설치 없는 학습을 기본 진입으로 두고 대화는 beta 지원 도구로 배치한다.

- **대화**: 기본 진입점. 학습, 코드, 자동화 목표를 자연어로 말한다.
- **학습**: 순수 학습 공간. Codaro 커리큘럼과 나만의 커리큘럼을 학습 셀 카드로 읽고 실행한다.
- **노트북**: 빈 노트북. Python 셀과 Markdown 셀에서 직접 작성하고 실행한다.
- **자동화**: 검증된 셀 조합과 스크립트를 모으고, 태스크로 예약 실행한다.

네 표면 모두 같은 문서 모델, 같은 실행 엔진, 같은 API 위에서 동작한다.
사용자는 대화로 학습 → 학습 셀에서 공부 → 노트북에서 코드 작성 → 자동화로 등록 → 태스크 예약 실행의 **연속 흐름**을 가진다.

## Codaro형 IDE 경계

Codaro는 범용 편집기 기능 수로 경쟁하는 IDE가 아니다. 평범한 Percent Python source를 편집하고 저장하며 reactive graph로 실행하고, 변수와 출력 확인, 앱 preview, publication 작업면, 자동화 승격까지 같은 source 위에서 잇는 local-first Python IDE다.

- source control UI, 범용 debugger, extension marketplace와 실시간 공동 편집은 필수 제품 claim이 아니다.
- 전체 앱 publication은 AppSpec과 compiler target을 사용한다.
- 부분 임베딩은 선택한 entry block과 dependency closure만 output, interactive, editable bundle로 만든다.
- Python SDK는 같은 authoring API와 publication owner를 library로 노출하며 별도 runtime을 만들지 않는다.

## 앱 projection

앱은 다섯 번째 편집 표면이 아니라 같은 노트북을 결과 중심으로 읽는 projection이다. 편집기의 `앱 미리보기` 버튼은 한 번의 행동으로 이 projection을 열고, `codaro app notebook.py`는 같은 projection을 editor chrome 없이 연다.

- entry가 비어 있으면 모든 실행 가능 block을 표시하고, entry가 있으면 그 block만 지정한 순서로 표시한다.
- `hideCode`는 Python source를 화면에서 감출 뿐 보안 경계가 아니다. source 은닉이 필요한 공개 앱은 이후 server publication 계약을 따라야 한다.
- `notebook`, `stack`, `grid`, `learning` layout과 entry, code visibility, state policy 변경은 AppSpec으로 자동 저장한다.
- `none`과 `perSession`은 현재 앱 projection에서 실행할 수 있다. `shared`는 안전한 공유 상태 owner가 생기기 전까지 명확한 안내와 함께 실행을 차단한다.
- 앱은 노트북의 reactive graph, kernel session, widget callback을 그대로 사용한다. 앱 전용 실행기나 복제된 notebook state를 만들지 않는다.
- 앱 전체를 배포하거나 선택 기능 블록만 다른 페이지에 넣을 수 있다. 두 경로 모두 같은 source와 compiler closure를 사용하고, 부분 임베딩을 다섯 번째 편집 표면으로 취급하지 않는다.
- 현재 실행이 실패하면 마지막 정상 결과를 `stale`로 표시하고 현재 오류를 함께 보여 준다. 실패를 이전 성공으로 위장하지 않는다.
- 브라우저 session마다 widget state와 kernel session을 격리한다.

## 제품 흐름에서의 `editor/` 위치

- `editor/`는 Codaro 제품 표면 폴더명이다.
- 기본 진입은 대화다.
- 노트북은 빈 문서에서 시작한다. 이상한 예제 셀이나 스니펫을 기본으로 넣지 않는다.
- 대화에서 만든 YAML curriculum은 학습 표면에서 학습 셀로 전개되고, 사용자는 그 셀을 실행/수정/검증한다.
- 같은 `.py` 문서는 노트북에서는 편집 단위, 학습에서는 학습 실행 단위, 자동화에서는 태스크 원본이 된다. 리포트는 별도 1급 표면이 아니라 자동화/태스크 실행 결과의 산출물이다.
- 폐기된 이전 편집기는 현재 제품 판단 기준이 아니다. 새 제품 판단 기준은 `editor/`다.
- 분할 모드는 제품의 1급 표면이 아니다.

## 관련

- [[learning-three-pillars]] - 학습 모드의 콘텐츠
- [[automation-tasks-reports]] - 자동화, 태스크, 실행 결과 산출물
- [[widget-bridge]] - 모드별 위젯 렌더링
- [[percent-format]] - AppSpec의 파일 저장 계약
- [[python-product-journey]] - IDE에서 앱, 부분 임베딩, publication과 SDK까지의 전체 여정
