# `_attempts/` — 실험 샌드박스 (운영 비포함)

여기는 **운영 테스트(본진)와 분리된 실험 공간**이다. 새 자동화 메커니즘 — 브라우저
무중단 객체 유지, OS 자동화 객체 상주 등 — 을 정식 게이트에 박기 전에 먼저 여기서
프로토타이핑·검증한다.

## 격리 보장 (왜 안전한가)

- `backend` 게이트(`pytest tests/`)는 `--ignore=tests/_attempts`로 이 디렉터리를
  **수집하지 않는다**. 즉 여기 실험이 깨져도 운영 preflight/CI는 흔들리지 않는다.
- `_attempts`는 `preflight`, `quality-cycle`, CI 어디에도 들어가지 않는다.
- 실험을 **돌려보고 싶을 때만** 전용 비운영 게이트로 실행한다:

  ```bash
  uv run python -X utf8 tests/run.py gate attempts
  ```

  이 게이트는 `tier="experiment"`이며 `tests/run.py tier fast|surface|release`
  스윕에도 포함되지 않는다.

## 카테고리 구조

```
tests/_attempts/
  testSandboxSmoke.py      # 샌드박스 배선이 살아있는지 확인하는 smoke
  browserPersistence/      # Playwright 무중단 객체 유지 R&D (autoDidimAi 패턴 이식 검토)
  osAutomation/            # OS 자동화 객체(입력/비전/음성) 상주 실험
```

새 실험 도메인이 필요하면 `_attempts/<도메인>/` 하위 폴더를 추가하고, 수집 대상으로
삼고 싶으면 `test*.py` 명명을 따른다 (camelCase).

## 승격(promotion) 경로

실험이 검증되면 **여기 남기지 않는다**:

1. 메커니즘을 `src/codaro/automation/`(또는 해당 도메인)으로 이식한다.
2. 정식 회귀 테스트를 `tests/<도메인>/`에 추가하고 `tests/run.py`의 게이트로 배선한다.
3. 운영 문서(`docs/skills/ops/foundation/testing-and-gates.md`,
   해당 아키텍처 문서)를 같은 변경에서 갱신한다.
4. `_attempts/` 안의 해당 실험 파일을 삭제한다.

`_attempts/`는 누적 보관소가 아니라 **회전하는 작업대**다. 끝난 실험은 승격하거나
지운다.
