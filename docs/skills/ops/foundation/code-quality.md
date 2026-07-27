---
id: code-quality
title: 코드 품질 원칙
description: Code quality rules for naming, exceptions, and maintainable changes.
category: ops
section: foundation
order: 302
purpose: camelCase / 불필요 파일 정리 / 인라인 주석 금지 / bare except 금지 / 좁힌 예외 + 로깅 + from exc 체인 / ruff BLE001·S110·S112·TRY400.
whenToUse: 새 코드 작성, 예외 처리 결정, 코드 리뷰, ruff lint 결과 해석할 때.
---

# 코드 품질 원칙

- 정공법은 코드 품질 판단의 최상위 원칙이다. 목표를 더 작은 호환안, 임시 우회, 중복 배선으로 바꾸지 않고 근본 원인과 올바른 소유 경계를 고친다.
- 하나의 계약과 상태에는 하나의 owner를 둔다. 여러 표면에 같은 규칙을 복사하지 않고 SSOT, adapter, 생성 경계로 연결한다.
- 기존 구조가 목표를 수용하지 못하면 필요한 리팩터링을 같은 작업 범위에 포함한다. 변경량을 줄이기 위해 잘못된 계층, 순환 의존, 죽은 호환 경로를 유지하지 않는다.
- 모듈은 한 가지 책임, 명시적 입출력, 좁은 의존 방향을 갖는다. 새 기능을 거대 조립 파일에 추가하기 전에 적절한 domain·engine·transport 경계를 먼저 정한다.
- 증상 수정만으로 끝내지 않는다. 실패를 재현하고 근본 원인을 고친 뒤 정상 경로와 부정 경로를 모두 회귀 테스트로 고정한다.
- 전문 검토 결과는 참고 입력이다. 현재 source와 실행 증거로 다시 확인한 사실만 구현과 완료 판정에 반영한다.
- 파일/폴더/함수/변수는 `camelCase`, 클래스는 `PascalCase`, 상수는 `UPPER_CASE`를 사용한다.
- 불필요한 캐시, 산출물, 백업성 폴더는 삭제한다. 보존이 필요한 자료만 명확한 제품 자산 위치로 옮긴다.
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
