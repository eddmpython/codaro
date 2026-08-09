# ProofGraph receipt

상태: 대기

## 목표

SourceRevision, BuildArtifact, FunctionalCheckReceipt, OperationalRunReceipt, DeploymentReceipt를 hash로 연결하는 닫힌 계약과 archive를 만든다. LearningEvent는 능력 보증 owner로 유지한다.

## 영향 파일

- `contracts/sourceRevision.schema.json`
- `contracts/operationalReceipt.schema.json`
- `contracts/deploymentReceipt.schema.json`
- `src/codaro/curriculum/capabilityProjection.py`
- 새 `src/codaro/proof/`
- `tests/contracts/`, `tests/proof/`

## 영향 함수·심볼

- 새 canonical JSON serializer와 `receiptDigest`
- 새 `SourceRevision`, `OperationalRunReceipt`, `DeploymentReceipt`
- 새 append-only `ProofArchive`
- `projectCapability`의 trusted operational receipt 입력

## 테스트

- unknown schema version과 extra field를 fail closed로 거부한다.
- source, build, input, permission, check, artifact hash 중 하나라도 다르면 연결을 거부한다.
- 같은 receipt import는 idempotent하고 같은 ID의 다른 payload는 conflict로 격리한다.
- legacy TaskRun을 operational receipt로 소급 생성하지 않는다.

## 롤백

새 archive는 LearningEvent archive와 별도 root에 둔다. writer 전환 전 reader와 fixture를 먼저 추가하고, 실패 시 새 proof projection만 비활성화해 기존 학습 보증을 보존한다.

## 평가

개발자 관점에서는 mutable ID가 아니라 content identity가 상태 전이를 소유해야 한다. PM 관점에서는 능력, 결과물, 운영, 배포, 가용성을 사용자가 각각 근거와 함께 볼 수 있어야 한다.
