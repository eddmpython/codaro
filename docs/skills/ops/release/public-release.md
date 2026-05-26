---
id: public-release
title: Public Release Readiness
description: Public distribution readiness rules for security, privacy, support, supply chain, and objective gate evidence.
category: ops
section: release
order: 307
purpose: 대중 사용 목표에서 Codaro가 공개 배포 준비 상태인지 객관 gate와 문서 증거로 판정한다.
whenToUse: 공개 릴리즈, 외부 사용자 안내, 보안/개인정보/지원/공급망 기준을 닫을 때.
---

# Public Release Readiness

Codaro의 대중 사용 준비는 “기능이 많다”가 아니라 사용자가 공개 저장소와 로컬 설치물을 보고 신뢰할 수 있는 상태를 뜻한다. 기준은 hosted service가 아니라 local-first public distribution이다.

## External Baseline

| 기준 | 적용 범위 |
|---|---|
| NIST SSDF SP 800-218 | secure development, vulnerability response, release integrity |
| OWASP ASVS | local API/editor web surface security control checklist |
| CISA Secure by Design | user safety, secure defaults, ownership of customer security outcomes |
| OpenSSF Scorecard | repository security hygiene and automated security signals |
| SLSA | build provenance, release workflow hardening |
| SPDX SBOM | release artifact dependency transparency |
| WCAG 2.2 | public UI accessibility floor |
| GitHub security policy guidance | `SECURITY.md` reporting path |

Source URLs:

- https://csrc.nist.gov/pubs/sp/800/218/final
- https://owasp.org/www-project-application-security-verification-standard/
- https://www.cisa.gov/securebydesign
- https://openssf.org/scorecard/
- https://slsa.dev/
- https://spdx.dev/about/overview/
- https://www.w3.org/TR/WCAG22/
- https://docs.github.com/en/code-security/getting-started/adding-a-security-policy-to-your-repository

## Release Stop Rule

대중 사용 목표에서는 아래가 하나라도 깨지면 release-ready가 아니다.

- `uv run python -X utf8 tests/run.py quality-cycle`
- `uv run python -X utf8 tests/run.py gate objective-nineplus-audit`
- `uv run python -X utf8 tests/run.py gate public-readiness-audit`
- tracked worktree clean
- current HEAD와 모든 audit artifact의 `gitHead` 일치

`public-readiness-audit`는 별도 release gate다. `quality-cycle`에 넣지 않는 이유는 공개 준비 gate가 이미 최신 `quality-cycle`과 `objective-nineplus-audit` artifact를 요구하기 때문이다.

## Required Public Files

루트에는 아래 파일이 있어야 한다.

- `SECURITY.md`: vulnerability disclosure, supported versions, safe harbor, response targets
- `PRIVACY.md`: local-first data boundary, provider credential handling, telemetry default, diagnostic export redaction
- `SUPPORT.md`: bug/support/security path split, diagnostic export instructions
- `CONTRIBUTING.md`: setup, gates, secret ban, release bar
- `CODE_OF_CONDUCT.md`: community standards and enforcement
- `LICENSE`, `LICENSE-CONTENT.md`, `TRADEMARKS.md`: source/content/brand rights boundary
- `publicReadinessChecklist.md`: 공개 준비 완료 조건

## Supply Chain

- Dependabot은 GitHub Actions, root Python, `editor`, `landing`, `launcher/codaro-launcher` dependency를 감시한다.
- Security workflow는 CodeQL, dependency review, OpenSSF Scorecard를 실행한다.
- Product release workflow는 exact wheel, launcher artifact, runtime archive, checksum, rollback path, SPDX SBOM을 함께 둔다.
- PyPI publish는 launcher update 필수 경로가 아니며, 필요 시 별도 trusted publishing workflow로 분리한다.
- SBOM을 자동 생성하지 못하는 release는 최소한 생성 명령과 누락 사유를 release note에 남긴다.

## Support and Incident Response

- 일반 bug는 issue template으로 받는다.
- 보안 취약점은 공개 issue가 아니라 `SECURITY.md` 절차로 받는다.
- Diagnostic export는 secret redaction 확인 후 공유한다.
- high impact issue는 triage decision, mitigation plan, user-facing note를 남긴다.
- 릴리즈 후 회귀는 launcher last-known-good/rollback evidence와 연결해서 안내한다.

## Public Readiness Scorecard

`public-readiness-audit`는 다음 domain을 모두 9.0 이상으로 요구한다.

1. `public-security`
2. `privacy-data-boundary`
3. `supply-chain-release`
4. `support-incident-response`
5. `public-docs-onboarding`
6. `accessibility-user-safety`
7. `objective-evidence-integrity`

Verifier는 text-only 선언을 통과시키지 않는다. 최신 `quality-cycle`, `objective-nineplus-audit`, clean tracked worktree, root checklist, public files, GitHub workflow/config 증거를 함께 읽는다.
