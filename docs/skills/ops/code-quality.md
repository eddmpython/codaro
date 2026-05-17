---
id: code-quality
title: 코드 품질 원칙
description: Code quality rules for naming, exceptions, and maintainable changes.
category: ops
section: guides
order: 302
purpose: camelCase / 파일 삭제 금지 / 인라인 주석 금지 / bare except 금지 / 좁힌 예외 + 로깅 + from exc 체인 / ruff BLE001·S110·S112·TRY400.
whenToUse: 새 코드 작성, 예외 처리 결정, 코드 리뷰, ruff lint 결과 해석할 때.
---

# 코드 품질 원칙

- 파일/폴더/함수/변수는 `camelCase`, 클래스는 `PascalCase`, 상수는 `UPPER_CASE`를 사용한다.
- 파일 삭제는 금지하고, 정리가 필요하면 `_backup/`으로 이동하는 방식을 우선한다.
- 인라인 주석은 넣지 않는다.
- bare except (`except:`) 절대 금지
- `except Exception: pass`는 금지. 로깅 없는 삼킴은 허용하지 않는다.
- `except Exception:` 사용 시 반드시: (1) 예외 변수 바인딩 (`as exc`), (2) 최소 logger.debug 이상 로깅, (3) 좁힐 수 없는 사유가 명확해야 한다.
- 예외 타입은 가능한 한 좁힌다 (json.JSONDecodeError, OSError 등 구체 타입 우선).
- try-except를 if-else 대용으로 쓰지 않는다.
- asyncio.create_task()에는 done_callback을 붙여 예외를 수면 위로 올린다.
- dispose/cleanup 패턴은 `errorGuard.safeDispose()`를 사용한다.
- raise 시 원본 예외 체인을 유지한다 (`raise ... from exc`).
- 사용자 입력 검증은 가능하면 early return으로 처리한다.
- ruff 린트 규칙 BLE001, S110, S112, TRY400이 pyproject.toml에 설정되어 있다. 정당한 면제는 `# noqa:` 주석으로 처리한다.
- 초기 단계일수록 "대충 동작"보다 "계층이 맞는가"를 우선한다.
