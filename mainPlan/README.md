# mainPlan 운영 규칙

`mainPlan/`은 제품의 장기 이니셔티브를 구현 가능한 작업 단위로 분해하는 설계 SSOT다. 한 이니셔티브 아래에 문서를 평평하게 쌓지 않는다. 실행 단위마다 폴더를 만들고, 완료는 상태 문구가 아니라 `_done` 경로 이동으로 증명한다.

## 디렉터리 계약

```text
mainPlan/
├── README.md
├── <initiative>/
│   ├── README.md
│   ├── 00-<workstream>/
│   │   └── README.md
│   ├── 01-<workstream>/
│   │   └── README.md
│   └── _done/
│       └── <completed-workstream>/
│           └── README.md
└── _done/
    └── <completed-initiative>/
```

## 운영 규칙

1. 이니셔티브 루트에는 인덱스 `README.md`와 작업 폴더, `_done/`만 둔다. 세부 플랜 파일을 이니셔티브 루트에 나열하지 않는다.
2. 작업 폴더 이름은 `NN-kebab-name`을 쓴다. 번호는 의존 순서이며, 병렬 가능 여부는 이니셔티브 인덱스에 적는다.
3. 각 작업 폴더의 `README.md`는 목표, 범위, 구현 순서와 함께 `영향 파일`, `영향 함수·심볼`, `테스트`, `롤백`, `평가`를 반드시 포함한다.
4. 활성 트리의 상태 필드에는 `설계`, `대기`, `진행`, `차단`만 쓴다. 완료 조건을 설명할 수는 있지만 상태를 `완료`, `done`, 체크 완료로 표시하지 않는다.
5. 작업 완료는 구현, 지정 테스트, 시각 검토, 관련 문서 갱신까지 끝낸 뒤 해당 폴더를 이니셔티브의 `_done/`으로 이동한 경우만 인정한다.
6. 이동된 작업 문서 상단에는 완료일, 검증한 커밋, 통과한 게이트, 남은 후속 위험을 기록한다. 이 네 증거가 없으면 `_done`으로 이동하지 않는다.
7. 이니셔티브 완료는 모든 작업 폴더가 내부 `_done/`으로 이동하고 최종 품질 작업까지 통과한 뒤, 이니셔티브 전체를 `mainPlan/_done/`으로 이동한 경우만 인정한다.
8. 범위 폐기는 완료와 구분한다. 폐기 사유와 대체 결정을 문서에 기록한 뒤 `_done/`으로 이동하고 상태를 `폐기`로 표시한다.
9. 플랜은 자기충족적이어야 한다. 구현자가 코드를 다시 전수 조사하지 않고도 파일, 심볼, 테스트, 롤백 순서를 알 수 있어야 한다.
10. `mainPlan/`만 저장소의 camelCase 이름 규칙에서 예외로 두며, 폴더 번호와 kebab-case를 허용한다.
11. 한 workstream이 여러 실행 packet을 가지면 내부에 `NN-kebab-name/README.md`와 `_done/`을 둔다. packet도 구현·테스트·문서·증거가 모두 끝나 내부 `_done/`으로 이동하기 전에는 완료가 아니다.

## 완료 증거 schema

완료 packet에는 이동 전 `completion-evidence.yml`을 만든다. `mainPlan/completion-evidence.schema.yml`이 다음 필드를 검증한다.

- `schemaVersion`, `initiativeId`, `packetId`, `completedAt`, `gitCommit`
- 각 gate의 `name`, `reportPath`, `reportHash`, `gitHead`, `passedAt`
- visual/content review의 reviewer role, status, reviewed asset/ledger hash
- `docsUpdated`, `parentIndexUpdated`, `residualRisks`

완료는 세 commit으로 처리한다. commit A는 구현을 고정한다. clean A에서 gate를 실행한 report는 `gitHead=A`를 기록하고, commit E는 report snapshot과 `completion-evidence.yml`만 추가해 `completion-evidence.yml.gitCommit=A`를 고정한다. 같은 파일 안에 자기 commit hash를 쓰는 것은 Git hash 구조상 불가능하므로 E 자신의 hash를 evidence 본문에 넣지 않는다. `docs/skills/ops/tools/completeMainPlanPacket.py --implementation-commit A --evidence-commit E`는 `E^=A`, E의 report hash와 schema를 검증한 뒤 packet move, parent link, active index, `mainPlan/completion-transition-ledger.yml` row를 준비하며 이 변경만 commit B로 만든다. row schema는 `schemaVersion`, UUIDv4 `nonce`, `transitionId`, initiative/packet ID, implementation commit, evidence commit, from/to path, evidence hash, preparedAt을 요구한다. `transitionId`는 RFC 8785 JCS object `{initiativeId,packetId,implementationCommit,evidenceCommit,nonce}` UTF-8 bytes의 SHA-256으로 계산한다. nonce와 transition ID는 전역 unique이고 같은 initiative/packet 또는 from path의 row는 하나뿐이다. `tests/plan/verifyMainPlanCompletion.py --transition-head B`는 `B^=E`, `E^=A`이고 B diff가 허용된 이동·index·evidence·ledger뿐인지 확인한다. evidence가 자기 자신인 E나 B hash를 요구하지 않으며 Git history와 nonce로 transition commit을 식별한다. concurrent branch가 같은 packet transition 두 개를 만들면 자동 winner를 고르지 않고 merge gate가 실패하며 한 branch를 merge 전에 rebase/drop해야 한다. active status 허위 완료, evidence 없는 `_done`, stale A/E, 끊긴 parent link는 모두 차단한다.

현재 이 schema와 tool의 bootstrap owner는 `astryx-product-experience/00-product-contract/01-prd-improvement-loop/02-completion-and-gate-bootstrap/`이다. commit A에 tool·schema를 구현하고, clean A에서 gate를 실행해 commit E에 bootstrap packet evidence를 고정한 뒤 A에 포함된 tool로 commit B를 준비한다. manual `_done` 예외는 없으며 bootstrap이 끝나기 전 다른 활성 packet을 `_done`으로 이동하지 않는다.

## 활성 이니셔티브

| 이니셔티브 | 상태 | 목표 |
| --- | --- | --- |
| [astryx-product-experience](astryx-product-experience/) | 설계 | Astryx 공용 디자인 시스템으로 랜딩, 웹 Run, 로컬 제품, 학습 경험을 하나의 고품질 제품군으로 통합한다. |

## 완료 판정 예시

- `mainPlan/astryx-product-experience/07-landing-experience/`: 아직 끝나지 않음
- `mainPlan/astryx-product-experience/_done/07-landing-experience/`: 해당 작업만 끝남
- `mainPlan/_done/astryx-product-experience/`: 전체 이니셔티브가 끝남
