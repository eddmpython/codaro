# Support

Codaro 지원은 재현 가능한 진단과 공개 이슈 기록을 우선합니다. 보안 취약점은 이 문서가 아니라 [Security Policy](SECURITY.md)를 따릅니다.

## Where to Ask

| 유형 | 위치 |
|---|---|
| Bug report | GitHub Issues bug report template |
| 학습 콘텐츠 오류 | GitHub Issues |
| 설치/런처 문제 | GitHub Issues with diagnostic export |
| 보안 취약점 | Private security report, not a public issue |
| 상업적 사용/브랜드 허가 | Repository owner contact |

## What to Include

- OS와 Python/Node/Rust 버전
- Codaro commit/tag
- 실행한 명령
- 기대 결과와 실제 결과
- 재현 가능한 최소 notebook, curriculum, script
- Diagnostic export에서 secret이 제거됐는지 확인한 payload

## Diagnostic Command

문제 재현 전후에 아래 gate 결과를 첨부하면 유지보수가 빨라집니다.

```powershell
uv run python -X utf8 tests/run.py preflight
uv run python -X utf8 tests/run.py gate diagnostic-summary-contract
```

공개 배포 준비 상태 자체를 확인하려면 아래 gate를 사용합니다.

```powershell
uv run python -X utf8 tests/run.py gate public-readiness-audit
```

## Response Expectation

이 저장소는 상업적 SLA를 제공하지 않습니다. 다만 public-ready 기준에서는 확인 가능한 bug report를 triage하고, 심각도와 재현 가능성에 따라 수정, 문서화, known issue, 지원 범위 제외 중 하나로 닫습니다.
