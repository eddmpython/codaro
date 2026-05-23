# Codaro Launch Kit

이 파일은 공개 후 첫 방문자가 Codaro를 5분 안에 이해하고, 직접 따라 하고, 공유할 수 있게 만드는 launch skeleton이다.

## One Line

Codaro는 Python 학습, 코드 실행, 개인 자동화를 한 화면에서 이어 주는 local-first 스튜디오다.

## Short Pitch

Codaro는 초보자가 Python을 배우다가 바로 실행하고, 실행한 코드를 자동화 루틴으로 키울 수 있게 만든다. Notebook처럼 셀을 실행하고, 학습 카드처럼 흐름을 따라가며, 완성된 코드는 반복 작업으로 저장하는 것이 핵심이다.

## Audience

| 대상 | 왜 관심을 갖는가 | 첫 진입점 |
|---|---|---|
| Python 입문자 | 설치와 실행 사이에서 막히지 않고 바로 학습하고 싶다 | Python 30일 과정 |
| 개인 자동화 사용자 | 파일 정리, 데이터 요약, 반복 작업을 직접 고치고 싶다 | public launch demos |
| 강의/코칭 운영자 | 학습 콘텐츠와 실행 환경을 같이 보여주고 싶다 | 5분 quickstart |
| 도구 제작자 | notebook, runtime, automation surface 구조를 보고 싶다 | public release docs |

## Proof Points

- Local-first: 기본 학습/실행은 사용자 컴퓨터 안에서 동작한다.
- Verifiable: `quality-cycle`, `objective-nineplus-audit`, `public-readiness-audit`가 같은 clean HEAD에서 증거를 남긴다.
- Learn by running: curriculum YAML이 학습 카드와 실행 셀로 전개된다.
- Automation-ready: 같은 코드 흐름을 task, schedule, workflow로 확장한다.
- Public trust: security, privacy, support, license, release supply chain 문서가 루트에 있다.

## First Five Minutes

1. README에서 “바로 시작” 표를 본다.
2. [fiveMinuteQuickstart](demos/publicLaunch/fiveMinuteQuickstart.md)를 따라 한다.
3. [expenseSummaryDemo](demos/publicLaunch/expenseSummaryDemo.py)를 실행해 CSV 요약이 바로 나오는지 본다.
4. [fileOrganizerDemo](demos/publicLaunch/fileOrganizerDemo.py)를 실행해 파일 정리 계획이 안전하게 dry-run 되는지 본다.
5. [videoStoryboard](demos/publicLaunch/videoStoryboard.md) 흐름으로 실제 Codaro 화면을 녹화한다.

## Demo Commands

```powershell
uv run python -X utf8 demos/publicLaunch/expenseSummaryDemo.py
uv run python -X utf8 demos/publicLaunch/fileOrganizerDemo.py
```

## Launch Day Checklist

- [ ] README 첫 화면이 “무엇인지, 왜 쓰는지, 5분에 무엇을 해볼지”를 바로 보여준다.
- [ ] 영상 썸네일과 첫 10초에 Python 학습, 실행, 자동화가 모두 보인다.
- [ ] `demos/publicLaunch/`의 두 Python demo가 clean repo에서 실행된다.
- [ ] GitHub Release note가 설치, quickstart, known limits, support path를 포함한다.
- [ ] 보안/개인정보 문의는 public issue가 아니라 `SECURITY.md`와 `PRIVACY.md`로 연결한다.
- [ ] 공개 글은 “notebook clone”이 아니라 “learning + execution + automation studio”로 설명한다.

## Launch Copy

짧은 문구:

> Python을 배우는 순간부터 실행하고, 실행한 코드를 자동화로 키우는 local-first 스튜디오.

긴 문구:

> Codaro는 Python 학습, notebook 실행, 개인 자동화 루틴을 같은 문서 모델로 묶습니다. 입문자는 학습 카드로 시작하고, 코드는 셀에서 바로 실행하며, 반복되는 작업은 task와 workflow로 확장합니다.

## Success Metrics

| 기간 | 지표 | 목표 |
|---|---|---|
| 24시간 | README 방문 후 quickstart 클릭 | 첫 공개 반응 확인 |
| 7일 | GitHub stars, issue, discussion, clone 수 | 메시지 선명도 확인 |
| 14일 | demo 영상 완주 댓글, 설치 성공 제보 | 첫 사용자 마찰 확인 |
| 30일 | Python 30일 과정 시작/완주 제보 | 학습 가치 확인 |

## Not Ready If

- 실행 가능한 demo 없이 철학 설명만 남아 있다.
- 설치 전 사용자가 무엇을 눌러야 하는지 모른다.
- provider 연결이 없어도 되는 기본 학습 흐름을 보여주지 못한다.
- public-readiness evidence가 최신 HEAD가 아니다.
