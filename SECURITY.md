# Security Policy

Codaro는 로컬 우선 학습/자동화 도구입니다. 공개 사용 준비 기준에서는 보안 문제를 기능 요청과 분리해 접수하고, 재현 가능한 증거와 수정 기록을 남깁니다.

## Supported Versions

| Version | Supported |
|---|---|
| `main` | Yes |
| Tagged releases | Best effort until the next tagged release |
| Forks or modified distributions | No |

## Reporting a Vulnerability

보안 취약점은 공개 issue에 먼저 올리지 않습니다.

1. GitHub Security Advisory가 활성화된 경우 private advisory로 제보합니다.
2. advisory를 사용할 수 없으면 repository owner에게 비공개 채널로 연락합니다.
3. 제보에는 영향을 받는 commit/tag, 재현 단계, 기대 영향, 관련 로그를 포함합니다.
4. access token, API key, refresh token, session cookie, 개인 파일 원문은 보내지 않습니다. 필요한 경우 redacted diagnostic export만 공유합니다.

## Response Targets

| 단계 | 목표 |
|---|---|
| Initial acknowledgement | 3 business days |
| Triage decision | 7 business days |
| Fix or mitigation plan | 14 business days for confirmed high impact issues |
| Public note | Fix release 후 영향, 완화, 업그레이드 경로를 기록 |

## Scope

In scope:

- Local server API, editor runtime, launcher update/rollback path
- Provider credential storage and redaction
- Diagnostic export redaction
- Automation task safety controls, E-Stop, input guard
- Release workflow, package provenance, dependency update path

Out of scope:

- Social engineering against maintainers or users
- Denial-of-service testing against third-party services
- Access to data that is not your own
- Vulnerabilities caused only by unsupported forks or local policy changes

## Safe Harbor

Good-faith security research is welcome when it avoids privacy harm, service disruption, persistence, lateral movement, and public disclosure before a fix or mitigation is available. Stop testing and report promptly if sensitive data becomes visible.

## Baseline References

- NIST SSDF SP 800-218: https://csrc.nist.gov/pubs/sp/800/218/final
- OWASP ASVS: https://owasp.org/www-project-application-security-verification-standard/
- CISA Secure by Design: https://www.cisa.gov/securebydesign
- GitHub security policy guidance: https://docs.github.com/en/code-security/getting-started/adding-a-security-policy-to-your-repository
