# mainPlan 운영 규칙

`mainPlan/`은 아직 끝나지 않은 제품 작업만 보여 주는 임시 TODO 트리다. 구현이 끝난 작업의 영구 기록은 폴더나 완료 증빙 사본이 아니라 Git의 상세 commit message와 검증 가능한 제품 계약이 맡는다.

## 디렉터리 계약

```text
mainPlan/
├── README.md
└── <initiative>/
    ├── README.md
    ├── 00-<workstream>/
    │   └── README.md
    └── 01-<workstream>/
        ├── README.md
        └── 00-<packet>/
            └── README.md
```

## 운영 규칙

1. `mainPlan/`에는 현재 남아 있는 일만 둔다. 완료된 initiative, workstream, packet을 보관하는 `_done` 디렉터리를 만들지 않는다.
2. 작업 폴더 이름은 `NN-kebab-name`을 쓴다. 번호는 현재 의존 순서이며 작업 삭제 뒤 번호를 다시 맞추기 위한 대규모 rename은 하지 않는다.
3. 각 작업 폴더의 `README.md`는 목표, 범위, 구현 순서와 함께 `영향 파일`, `영향 함수·심볼`, `테스트`, `롤백`, `평가`를 반드시 포함한다.
4. 상태는 아직 남은 작업의 현재 위치를 나타내는 `설계`, `대기`, `진행`, `차단`만 쓴다. `완료`, `done`, 체크된 checkbox는 상태가 아니라 삭제 신호다. 해당 TODO 항목과 폴더를 바로 삭제한다.
5. 일부 하위 항목만 끝났다면 완료된 행과 설명을 TODO에서 제거하고 남은 일, 현재 blocker, 다음 검증만 유지한다. `현재 증거`, `현재 구현`, `구현 snapshot`, 날짜별 작업 기록처럼 끝난 일을 설명하는 section을 만들지 않는다.
6. 작업 삭제는 구현, 지정 테스트, 필요한 시각·사람 검토, 관련 문서 갱신이 모두 끝난 변경과 함께 처리한다. 종료 조건이 하나라도 남으면 TODO를 삭제하지 않는다.
7. 하위 packet이 모두 삭제되면 빈 parent workstream도 삭제한다. initiative의 모든 일이 끝나면 initiative 폴더도 삭제하고 `mainPlan/README.md`의 활성 목록에서 제거한다.
8. 범위를 폐기할 때도 별도 보관 폴더를 만들지 않는다. 폐기한 이유, 대체 결정, 사용자 영향은 삭제를 포함한 commit message에 기록한다.
9. 플랜은 자기충족적이어야 한다. 구현자가 코드를 다시 전수 조사하지 않고도 파일, 심볼, 테스트, 롤백 순서를 알 수 있어야 한다.
10. `mainPlan/`만 저장소의 camelCase 이름 규칙에서 예외로 두며 폴더 번호와 kebab-case를 허용한다.
11. 장기간 소비되는 schema, rubric, wire contract는 `contracts/`, 운영 규칙은 `docs/skills/`, 실행 보고서는 `output/test-runner/`가 소유한다. 임시 TODO가 제품 runtime이나 영구 계약의 source가 되면 안 된다.
12. leaf의 자체 구현과 검증이 끝났다면 상위 workstream의 독립 승인이나 release 대기를 이유로 leaf를 보관하지 않는다. 아직 필요한 승인·release action만 상위 TODO에 남기고 끝난 leaf는 삭제한다.

## Git 작업 기록

구현과 TODO 삭제 기록은 해당 변경의 commit message에 남긴다. 제목 다음에 아래 네 heading을 정확히 쓰고, 저장소 diff와 실행 결과로 확인되는 사실을 구체적으로 적는다.

```text
상황:
변경 전 문제, 사용자 요구, 재현 조건을 적는다.

변경:
삭제한 TODO와 실제 구현 파일, 핵심 심볼, 전후 동작을 적는다.

영향:
사용자 체감 변화, 호환성, 의도적으로 남긴 범위와 위험을 적는다.

검증:
실행한 명령, 통과·실패 결과와 확인한 수치를 적는다.
```

각 commit message가 하나의 작업 기록이고, 이 기록들이 쌓인 `git log`가 전체 구현 이력이다. mainPlan 안에 commit hash, workflow run ID, 통과 수치, gate report 사본, transition ledger, completion evidence를 중복 보관하지 않는다.

## 변경 절차

1. 구현 전 해당 TODO의 종료 조건과 영향 범위를 확인한다.
2. 제품 source, 계약, 테스트, 문서를 같은 작업 의도로 구현한다.
3. 지정 gate와 `git diff --check`를 실행한다.
4. 종료 조건을 모두 충족한 packet 또는 workstream을 삭제하고 parent 인덱스에서 링크와 설명을 제거한다.
5. `tests/plan/testMainPlanTodoPolicy.py`로 `_done`, 완료 증빙 파일, 깨진 local link가 없는지 확인한다.
6. 변경 전후 사실과 검증 결과를 상세 commit message에 기록한다.

## 활성 이니셔티브

아래 표에는 아직 남아 있는 제품 작업만 둔다. 끝난 작업의 기록은 이 트리가 아니라 commit message와 `git log`가 소유한다.

현재 활성 이니셔티브는 없다.
