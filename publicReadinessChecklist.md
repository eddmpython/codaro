# Codaro Public Readiness Checklist

이 체크리스트는 대중 사용 목표에서 “준비됐다”는 말을 금지하고, clean HEAD에서 객관 gate가 확인한 증거로만 완료를 선언하기 위한 루트 체크리스트다.

## Completion Rule

- [x] `quality-cycle`이 같은 `gitHead`에서 17/17 통과하고 `softFailureCount`가 0이다.
- [x] `objective-nineplus-audit`가 같은 `gitHead`에서 모든 객관 9점대 domain을 9.0 이상으로 통과한다.
- [x] `public-readiness-audit`가 같은 `gitHead`에서 모든 공개 준비 domain을 9.0 이상으로 통과한다.
- [x] Tracked worktree가 clean일 때만 완료를 선언한다.
- [x] 공개 준비 증거는 `output/test-runner/public-readiness-audit/public-readiness-report.json`에 남긴다.
- [x] 대중 공개용 launch kit, 5분 quickstart, 영상 storyboard, dry-run demo가 루트와 `demos/publicLaunch/`에 있다.

## Public Trust Surface

- [x] `SECURITY.md`가 취약점 신고, scope, response target, safe harbor를 정의한다.
- [x] `PRIVACY.md`가 local-first, provider boundary, telemetry default, diagnostic redaction을 정의한다.
- [x] `SUPPORT.md`가 bug/support/security 경로를 분리한다.
- [x] `CONTRIBUTING.md`가 gate, secret 금지, release 판단 기준을 정의한다.
- [x] `CODE_OF_CONDUCT.md`가 community enforcement 기준을 정의한다.
- [x] README가 공개 신뢰 문서와 readiness checklist로 연결된다.

## Supply Chain and Release

- [x] Dependabot이 GitHub Actions, Python, Node, Rust dependency update를 감시한다.
- [x] Security workflow가 CodeQL, dependency review, OpenSSF Scorecard를 실행한다.
- [x] PyPI publish workflow는 trusted publishing boundary를 유지한다.
- [x] Launcher release는 package/checksum/rollback 경계를 gate와 문서로 확인한다.
- [x] SBOM은 SPDX 형식으로 release artifact에 붙이는 것을 공개 release rule로 둔다.

## User Safety and Operations

- [x] Diagnostic export는 secret redaction 계약을 통과한다.
- [x] Provider credential은 기본 로그와 artifact에 남지 않는다.
- [x] Automation E-Stop과 input guard가 제품 품질 evidence에 포함된다.
- [x] Runtime/package/cell failure는 사용자가 복구 가능한 진단으로 분리된다.
- [x] 공개 issue template은 재현 정보와 diagnostic redaction 확인을 요구한다.

## Objective Baseline

- [x] NIST SSDF SP 800-218, OWASP ASVS, CISA Secure by Design, OpenSSF Scorecard, SLSA, SPDX SBOM, WCAG 2.2, GitHub security policy guidance를 공개 준비 기준의 외부 baseline으로 둔다.
- [x] 외부 baseline은 `docs/skills/ops/release/public-release.md`와 `public-readiness-audit` report에 URL로 남긴다.
- [x] 대중 사용 목표는 hosted service launch가 아니라 local-first public distribution readiness로 한정한다.
- [x] 런칭 메시지는 `docs/skills/ops/release/launch-playbook.md`와 `launchKit.md`를 SSOT로 삼는다.
