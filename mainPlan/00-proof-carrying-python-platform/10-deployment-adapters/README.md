# 배포 adapter

상태: 대기

## 목표

folder, zip, self-host를 core target으로 유지하고 GitHub Pages, Cloudflare 같은 외부 대상은 immutable bundle을 전달, probe, rollback하는 얇은 adapter로 만든다.

## 영향 파일

- 새 `src/codaro/publication/adapters/`
- `src/codaro/cli.py`
- `editor/src/components/app/`
- `contracts/deploymentAdapter.schema.json`
- `tests/publication/testDeploymentAdapters.py`

## 영향 함수·심볼

- 새 `DeploymentAdapter` protocol
- `prepare`, `upload`, `probe`, `rollback`
- credential reference와 redacted diagnostic
- `DeploymentReceipt` writer

## 테스트

- fake adapter로 upload, hash verify, probe, rollback을 완결한다.
- credential이 없어도 inspect, build, serve, zip은 통과한다.
- provider 오류가 build receipt나 learning proof를 바꾸지 않는다.
- upload된 bytes와 manifest root hash가 다르면 가용성 승격을 거부한다.

## 롤백

adapter는 core artifact를 수정하지 않는다. 원격 pointer 전환 전 새 target을 probe하고 실패하면 이전 pointer를 보존한다.

## 평가

개발자 관점에서는 provider SDK가 compiler나 proof domain에 들어오지 않아야 한다. PM 관점에서는 선택한 hosting 사업자가 사라져도 사용자의 source와 build가 남아야 한다.
