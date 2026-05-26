---
id: launch-playbook
title: Launch Playbook
description: Public launch playbook for positioning, demos, video, release notes, and first-user feedback.
category: ops
section: release
order: 308
purpose: 제품 품질 gate를 통과한 뒤 첫 사용자에게 어떻게 보여줄지 launch asset 기준을 고정한다.
whenToUse: README, 영상, 공개 글, 데모, 릴리즈 노트, 커뮤니티 공유 문구를 준비할 때.
---

# Launch Playbook

대중 공개는 기능 목록 발표가 아니라 첫 사용자가 5분 안에 “내가 왜 써야 하는지”를 이해하는 경험이다.

## Positioning

Codaro는 Python 학습, 코드 실행, 개인 자동화를 한 화면에서 이어 주는 local-first 스튜디오다.

피해야 할 설명:

- 단순 notebook clone
- 일반 code assistant
- hosted automation service
- 강의 자료 모음

써야 할 설명:

- 배우는 코드가 바로 실행된다.
- 실행한 코드가 자동화 루틴으로 커진다.
- 기본 학습은 provider 없이도 된다.
- 공개 준비 증거는 gate report로 남긴다.

## Required Launch Assets

| 자산 | 위치 | 완료 기준 |
|---|---|---|
| Launch kit | `launchKit.md` | positioning, proof point, metric, checklist 포함 |
| Quickstart | `demos/publicLaunch/fiveMinuteQuickstart.md` | 5분 안에 실행할 명령과 확인 장면 포함 |
| Video storyboard | `demos/publicLaunch/videoStoryboard.md` | 90초 장면, 화면, 말할 문장 포함 |
| Runnable demos | `demos/publicLaunch/*.py` | clean repo에서 읽기 전용 또는 dry-run으로 실행 |
| Social copy | `demos/publicLaunch/socialCopy.md` | 짧은 글, 커뮤니티 글, release note opening 포함 |
| Public post | `docs/blog/.../index.md` | landing build에 포함 |

## Demo Rules

- 첫 장면은 실제 제품 또는 실행 결과여야 한다.
- 코드가 실제 파일을 삭제하거나 이동하지 않는다.
- Provider 연결이 없어도 demo가 돌아간다.
- 오류가 생기면 사용자가 다음 행동을 알 수 있어야 한다.
- 영상에는 학습, 실행, 자동화가 모두 등장해야 한다.

## Launch Sequence

1. `uv run python -X utf8 tests/run.py quality-cycle`
2. `uv run python -X utf8 tests/run.py gate objective-nineplus-audit`
3. `uv run python -X utf8 tests/run.py gate public-readiness-audit`
4. `uv run python -X utf8 demos/publicLaunch/expenseSummaryDemo.py`
5. `uv run python -X utf8 demos/publicLaunch/fileOrganizerDemo.py`
6. README, launch kit, video storyboard, social copy를 최종 확인한다.
7. Release note에는 install, quickstart, support, known limits를 함께 둔다.

## First Feedback To Ask For

- 설치가 막힌 지점
- README 첫 화면에서 이해 안 된 문장
- 5분 quickstart에서 멈춘 단계
- 더 보고 싶은 자동화 예제
- Python 30일 과정에서 가장 막힌 Day

## Do Not Ship If

- Demo command가 실패한다.
- 영상 첫 10초가 제품 가치를 보여주지 못한다.
- README가 quickstart보다 내부 철학을 먼저 설명한다.
- 공개 준비 gate가 최신 HEAD가 아니다.
