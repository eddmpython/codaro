---
id: editor-intelligence
title: Python 편집기 분석과 수정
description: 문서 분석, 원본 버전에 묶인 수정 제안, 실행 상태 복제의 소유 경계.
category: architecture
section: reference
order: 205
---

# Python 편집기 분석과 수정

편집기는 작성 중인 문서를 분석하고 사용자가 선택한 변경만 적용한다. 실행 결과는 실행 당시의
코드에 속한다. 분석이나 수정 제안을 받는 동작으로 사용자 코드를 실행하지 않는다. 학습 표면은
[학습 경험](learning-experience.md)의 직접 입력과 직접 실행 원칙을 따른다.

## 문서와 분석

Python 분석과 편집 wire type의 소유자는 `src/codaro/document/codeIntelligence.py`다. 기존 정적
자동완성도 이 분석기를 호출한다. `genProductContracts.py`가 TypeScript 계약을 생성한다. 웹은 같은
Python 소스를 전용 worker에 로드하고 Local은 document API로 호출하므로 분석 의미를 두 언어에
재구현하지 않는다. 브라우저 분석 worker는 실행 커널과 분리해 편집 화면과 셀 실행을 점유하지 않는다.

`editor/src/lib/editorIntelligence/document.ts`는 셀과 파일의 좌표를 투영한다. Python의 문자 위치와
JavaScript의 UTF-16 위치는 분석 경계에서 변환한다. 문서 식별자와 현재 소스를 포함한 버전이
달라지면 늦게 도착한 분석 결과나 변경을 적용하지 않는다. 분석 파일은 임시 작업 공간 안에만
작성하고 사용자 코드는 실행하지 않는다. Jedi의 공유 상태는 분석 owner에서 직렬화한다.

`NotebookIntelligenceProvider`는 살아 있는 편집기의 내용과 문서 owner를 연결한다. 모든 변경 범위와
원본 일치를 먼저 검사한 뒤 `applyDraftUpdates`를 한 번 호출한다. 여러 셀의 이름 변경도 한 번의
되돌리기로 복구한다. 이후 사람이 고친 내용을 오래된 되돌리기로 덮어쓰지 않는다.

## 수정 제안

`src/codaro/ai/editorRepair.py`는 기존 copilot provider 설정으로 선택 영역의 교체 코드를 요청한다.
선택 영역이 없으면 해당 셀 전체를 사용한다. provider는 문서 쓰기나 실행 도구를 받지 않는다.
응답의 교체 코드에서 변경 구간을 계산하고 원본, 셀과 문서 버전에 묶는다.

`InlineRepair`는 원본과 제안을 함께 보여주며 `repairChanges.ts`가 선택한 변경만 적용한다. 요청 중
코드가 바뀌거나 변경 범위가 겹치면 다시 요청해야 한다. 모델 연결 오류나 잘못된 응답을 코드 수정
성공으로 표시하지 않는다. 실제 실행 정보는 이전 코드에서 나온 값일 수 있음을 함께 전달한다.

## 실행 상태와 검증

`EditorExecutionMachine`은 개발자가 기준 실행을 누른 문서를 별도 WASI Python 환경에서 실행한다.
이는 기존 학습용 Pyodide 커널의 상태를 복제한 것이 아니다. 두 환경의 패키지 지원 범위가 다르므로
기존 학습·publication 실행은 원래 runtime owner가 계속 담당한다.

기준 실행의 셀 직전·직후 checkpoint를 기록한다. 수정 검증은 최초 변경 셀 직전의 상태에서 새
프로세스를 열어 변경 셀과 이후 셀을 실행한다. 별도 검사 코드는 현재 기준 상태를 복제해 실행한다.
복제 프로세스는 성공과 실패 모두 종료하며 원본 실행 상태에는 수정 코드를 적용하지 않는다.
상태 복원은 해당 코드 버전의 실행 이력을 선택한 경우에만 허용한다.

pyproc 소비 버전은 `editor/package.json`과 lock이 소유한다. `generateMachineAssets.mjs`가 설치된
배포본을 같은 출처에 배치하고 공개 자산 CLI로 worker 무결성 목록을 만든다. 공개 root API와
반환된 Machine·process·session 계약만 사용한다. 임의의 호스트 네트워크·프로세스 권한을 연결하지
않으며 외부 효과가 checkpoint로 되돌아간다고 주장하지 않는다.

WASI 실행에 필요한 응답 격리는 Local 서버, 개발 서버와 공개 웹의 기존 service worker가 제공한다.
service worker 활성화는 캐시 이관과 제어권 획득까지만 기다린다. 페이지 새로고침은 기존
`index.html`의 `controllerchange`가 맡는다. 활성화 안에서 페이지 이동 완료를 기다리면 해당
페이지의 fetch가 활성화 완료를 기다리는 순환 대기가 생길 수 있다.
기존 publication 서버의 응답 정책은 publication owner를 따른다. 지원 환경을 확인할 수 없으면
실행 준비 실패를 표시하고 기존 커널의 실행 결과를 대신 내보내지 않는다.

## 검증 경로

`tests/editor/`는 Python 의미 분석과 수정 요청의 오류 경계를 검사한다.
`editor/scripts/testEditorDocument.mjs`는 셀 좌표, 버전 충돌과 부분 적용을 검사한다.
`editor/scripts/verifyEditorIntelligence.mjs`는 설치된 pyproc 공개 제어 API로 실제 브라우저에서
탐색·이름 변경·되돌리기·실행·복제 검사를 수행한다. 스크린샷과 검증 보고서는 공통 실행 공간에
기록하고 결과를 Git에 남긴 뒤 일회성 산출물을 정리한다.

`--repair-fixture`는 `tests/editor/repairFixtureServer.py`의 고정 provider와 실제 Local 경로를
사용해 변경 비교, 부분 적용, 되돌리기와 오래된 제안 거부를 검사한다. 실제 모델 연결 검증을
대체하지 않는다. `--execution-control`은 실행 중지까지, 기본 실행은 파일 상태 복제·복원까지
검사한다. 일부 경로만 통과한 결과로 전체 실행 계약을 통과했다고 기록하지 않는다.
