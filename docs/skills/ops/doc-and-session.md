---
id: doc-and-session
title: 문서 유지보수 + 세션 이어가기
category: ops
purpose: CLAUDE.md/AGENTS.md와 코드 구조가 어긋나면 즉시 갱신. 세션 종료 전 가장 가까운 docs/skills/.../README.md에 Current State / Next Action / Verification Left 갱신.
whenToUse: 세션 종료 직전, 폴더 구조 변경 후, 죽은 참조 발견 시.
---

# 문서 유지보수 원칙

- 세션 시작 시 `CLAUDE.md`와 실제 코드 구조를 대조하고, 낡은 내용이 있으면 즉시 갱신한다.
- 파일/폴더 추가, 삭제, 이동이 있으면 관련 경로와 구조 설명을 함께 갱신한다.
- 삭제된 기능이나 파일에 대한 죽은 참조를 남기지 않는다.

# 세션 이어가기 원칙

- 세션이 끝나도 다음 세션이 채팅 없이 바로 이어갈 수 있게 현재 결정, 진행 상태, 다음 액션, 남은 검증을 반드시 저장소 문서에 남긴다.
- 중간 상태의 TODO, blocker, diff는 채팅이 아니라 관련 기능 문서의 체크리스트로 남긴다.
- 작업이 여러 세션에 걸리면 가장 가까운 `docs/skills/{category}/README.md` (또는 해당 모듈의 SKILL 파일)에 최소한 `Current State`, `Next Action`, `Verification Left`를 갱신한다.
- 다음 세션은 먼저 프로젝트 메모리, 그다음 관련 기능 문서, 마지막으로 직전 수정 파일을 읽고 시작한다.
- 채팅 기록만 믿고 이어가지 않는다. 설계 결정과 남은 작업은 반드시 저장소 안 문서로 고정한다.
- 코드 변경이 있었는데 문서가 업데이트되지 않았다면 세션 종료 전에 문서를 먼저 맞춘다.
- `CLAUDE.md`와 `AGENTS.md` 동기화 검사는 `uv run python -X utf8 docs/skills/ops/tools/syncAgentsMd.py --check`로 수행한다.
