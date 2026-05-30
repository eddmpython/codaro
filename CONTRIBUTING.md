# Contributing

Codaro 기여는 local-first 학습/자동화 제품 품질을 깨지 않는 범위에서 받습니다. 작업 전 [CLAUDE.md](CLAUDE.md), [Codaro Skills](docs/skills/README.md), [testing-and-gates](docs/skills/ops/foundation/testing-and-gates.md)를 읽습니다.

## Local Setup

```powershell
uv run python -X utf8 tests/run.py preflight
```

Frontend:

```powershell
npm install --prefix editor
npm install --prefix landing
npm run build --prefix editor
npm run build --prefix landing
```

Launcher:

```powershell
cargo check --manifest-path launcher/codaro-launcher/Cargo.toml
```

## Required Quality Bar

| 변경 범위 | 최소 확인 |
|---|---|
| Python backend/runtime | `uv run python -X utf8 tests/run.py gate backend` |
| Editor UI | `uv run python -X utf8 tests/run.py gate editor-build` |
| Landing/docs | `uv run python -X utf8 tests/run.py gate landing-build` |
| Launcher/release | `uv run python -X utf8 tests/run.py gate install-launcher-smoke` |

릴리즈 판단 전에는 `quality-cycle`이 clean HEAD에서 통과해야 합니다.

## Coding Rules

- Python은 `uv run python -X utf8 ...`로 실행합니다.
- 이름은 `camelCase`, 클래스는 `PascalCase`를 씁니다.
- 파일 삭제는 금지합니다. 필요한 경우 `_backup/` 아래로 이동하고 이유를 남깁니다.
- Secret, token, API key, private notebook 원문을 commit하지 않습니다.
- Provider 연결은 선택적이어야 하며, 기본 학습 흐름은 provider 없이도 작동해야 합니다.
- 사용자에게 보이는 기본 UI copy는 한국어입니다.

## Pull Request Checklist

- 관련 gate를 통과했습니다.
- 공개 문서 또는 운영 규칙을 바꾼 경우 landing docs build를 갱신했습니다.
- 보안/개인정보/라이선스/브랜드 경계에 닿는 변경은 `SECURITY.md`, `PRIVACY.md`, `LICENSE`, `LICENSE-CONTENT.md`, `TRADEMARKS.md`와 모순되지 않습니다.
- Diagnostic export, logs, artifacts에 secret 원문이 없습니다.
