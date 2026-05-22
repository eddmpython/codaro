# Privacy Policy

Codaro는 local-first 로컬 우선 학습/자동화 스튜디오입니다. 기본 사용 흐름은 사용자의 컴퓨터 안에서 실행되며, 원격 전송은 사용자가 provider 연결, 배포, 동기화, 외부 링크 실행을 명시적으로 선택할 때만 발생해야 합니다.

## Data Codaro Handles

| 데이터 | 용도 | 기본 위치 |
|---|---|---|
| Notebook, curriculum, automation script | 학습/실행/자동화 | Local project/workspace |
| Provider settings | 선택한 provider 연결 상태 표시 | Local configuration |
| Credentials | provider 호출 인증 | OS/local secret storage boundary |
| Diagnostic summary/export | 문제 재현과 지원 | User-triggered local export |
| Build/test artifacts | 품질 검증 증거 | `output/test-runner/` |

## Default Network Boundary

- 기본 curriculum과 local runtime은 원격 provider 없이도 동작해야 합니다.
- Provider 연결은 사용자가 설정 화면에서 선택하고 검증한 뒤에만 사용합니다.
- OAuth, API key, custom base URL 같은 credential은 문서, 로그, diagnostic export, test artifact에 원문으로 남기지 않습니다.
- Telemetry는 기본값으로 사용하지 않습니다. 새로운 telemetry를 추가하려면 opt-in UI, 수집 항목, 보관 기간, 삭제 방법을 먼저 문서화해야 합니다.

## Diagnostic Export

Diagnostic export는 지원을 빠르게 하기 위한 redacted payload입니다. Export에는 provider/runtime/package/frontend 상태, 실패 범주, 다음 조치가 포함될 수 있지만 다음 값은 금지합니다.

- `token`, `apiKey`, `secret`, `Authorization`
- OAuth access/refresh token
- `sk-...` 형식의 key
- 사용자의 파일 원문이나 private notebook content

이 계약은 `diagnostic-summary-contract` gate와 `public-readiness-audit` gate가 검증합니다.

## User Control

- Local files는 사용자가 직접 삭제, 백업, 이동할 수 있어야 합니다.
- Provider credential은 provider 설정 화면 또는 OS/local secret storage boundary에서 제거할 수 있어야 합니다.
- Diagnostic export는 사용자가 명시적으로 복사하거나 공유할 때만 외부로 나갑니다.

## Children and Education Use

Codaro는 교육용 콘텐츠를 포함하지만, 계정 기반 어린이 개인정보 수집 서비스를 제공하는 형태로 운영하지 않습니다. 교실, 학원, 유료 강의, 기관 배포에 쓰려면 라이선스와 개인정보 처리 책임을 별도로 검토해야 합니다.
