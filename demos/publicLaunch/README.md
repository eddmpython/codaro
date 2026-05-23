# Public Launch Demos

이 폴더는 Codaro 공개 영상과 첫 사용자 quickstart에 쓰는 데모 skeleton이다. 모든 demo는 안전한 dry-run 또는 읽기 전용 흐름으로 시작한다.

## Run

```powershell
uv run python -X utf8 demos/publicLaunch/expenseSummaryDemo.py
uv run python -X utf8 demos/publicLaunch/fileOrganizerDemo.py
```

## Files

| 파일 | 용도 |
|---|---|
| [fiveMinuteQuickstart.md](fiveMinuteQuickstart.md) | 처음 온 사람이 5분 안에 따라 할 루트 |
| [videoStoryboard.md](videoStoryboard.md) | 사용자가 직접 찍을 90초 영상 스토리보드 |
| [socialCopy.md](socialCopy.md) | 공개 글, 커뮤니티, release note용 문구 |
| [teacherPromptCards.md](teacherPromptCards.md) | Codaro 안에서 바로 써볼 prompt 카드 |
| [expenseSummaryDemo.py](expenseSummaryDemo.py) | CSV를 읽어 카테고리별 합계를 보여주는 학습/자동화 demo |
| [fileOrganizerDemo.py](fileOrganizerDemo.py) | 다운로드 폴더 정리 계획을 dry-run으로 보여주는 자동화 demo |

## Demo Rule

- 실제 파일 이동, 삭제, 외부 요청은 하지 않는다.
- 첫 실행 결과가 10초 안에 보여야 한다.
- 영상에는 실행 전 코드, 실행 결과, 다음 자동화 확장 방향이 같이 보여야 한다.
